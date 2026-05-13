import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  collection, query, where, serverTimestamp, orderBy, increment, onSnapshot,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

const SupplierContext = createContext(null)

export function SupplierProvider({ children }) {
  const [screen, setScreen]       = useState('entry')
  const [activeTab, setActiveTab] = useState('home')

  // Auth state
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Vendor data from Firestore (new schema)
  const [vendorData, setVendorData]         = useState(null)
  const [packages, setPackages]             = useState([])
  const [products, setProducts]             = useState([])
  const [pricingRules, setPricingRules]     = useState([])
  const [loadingData, setLoadingData]       = useState(false)
  const [firestoreBlocked, setFirestoreBlocked] = useState(false)

  // Legacy aliases used by existing screens
  const supplierData    = vendorData
  const supplierName    = vendorData?.owner_full_name || vendorData?.business_name || ''
  const setSupplierName = () => {} // no-op — name derives from vendorData
  const catalog         = packages  // Catalog.jsx uses `catalog`

  // Navigation helpers
  const [leads, setLeads]           = useState([])
  const [events, setEvents]         = useState([])
  const [activeLead, setActiveLead] = useState(null)
  const [activeEvent, setActiveEvent] = useState(null)
  const [editPackage, setEditPackage] = useState(null)

  const TAB_SCREENS = ['home', 'insights', 'calendar', 'events', 'catalog', 'profile']
  const navigate = (s) => { setScreen(s); if (TAB_SCREENS.includes(s)) setActiveTab(s) }
  const goTab    = (tab) => { setActiveTab(tab); setScreen(tab) }

  const acceptLead = async (id) => {
    const lead = leads.find(l => l.id === id)
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'booked' } : l))
    const revenue = lead?.order_total || 0
    setVendorData(prev => prev ? {
      ...prev,
      total_events:  (prev.total_events  || 0) + 1,
      total_revenue: (prev.total_revenue || 0) + revenue,
    } : prev)
    try {
      const uid = auth.currentUser?.uid
      await Promise.all([
        updateDoc(doc(db, 'leads', id), { status: 'booked', updated_at: serverTimestamp() }),
        uid && updateDoc(doc(db, 'vendors', uid), {
          total_events:  increment(1),
          total_revenue: increment(revenue),
          updated_at:    serverTimestamp(),
        }),
      ])
    } catch (err) {
      console.error('acceptLead Firestore error:', err)
    }
  }

  const declineLead = async (id, reason = '') => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'declined', decline_reason: reason } : l))
    try {
      await updateDoc(doc(db, 'leads', id), {
        status: 'declined',
        decline_reason: reason,
        updated_at: serverTimestamp(),
      })
    } catch (err) {
      console.error('declineLead Firestore error:', err)
    }
  }

  const newLeadCount = leads.filter(l => l.status === 'new').length

  // ── Load vendor doc + sub-collections ────────────────────────
  const loadSupplierData = async (uid) => {
    setLoadingData(true)
    try {
      // Main vendor doc
      const snap = await getDoc(doc(db, 'vendors', uid))
      if (!snap.exists()) { setLoadingData(false); return false }

      setFirestoreBlocked(false)
      setVendorData({ id: snap.id, ...snap.data() })

      // packages sub-collection
      const pkgSnap = await getDocs(collection(db, 'vendors', uid, 'packages'))
      setPackages(pkgSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      // products sub-collection
      const prodSnap = await getDocs(collection(db, 'vendors', uid, 'products'))
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      // pricing_rules sub-collection
      const rulesSnap = await getDocs(collection(db, 'vendors', uid, 'pricing_rules'))
      setPricingRules(rulesSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      setLoadingData(false)
      return true
    } catch (err) {
      console.error('שגיאה בטעינת נתוני ספק:', err)
      if (err.code === 'permission-denied') {
        setFirestoreBlocked(true)
      }
      setLoadingData(false)
      return false
    }
  }

  // ── Load events from Firestore ────────────────────────────────
  const loadEvents = async (uid) => {
    try {
      const q = query(collection(db, 'events'), where('vendor_id', '==', uid))
      const snap = await getDocs(q)
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('שגיאה בטעינת אירועים:', err)
    }
  }

  // ── Normalize a raw Firestore lead doc to safe renderable shape ──
  const normalizeLead = (id, data) => {
    const toStr = (v) => {
      if (v === null || v === undefined) return ''
      if (typeof v === 'string') return v
      if (typeof v === 'number') return String(v)
      if (v?.toDate) return v.toDate().toLocaleDateString('he-IL') // Firestore Timestamp
      return String(v)
    }
    return {
      id,
      vendor_id:        data.vendor_id        || '',
      client_id:        data.client_id        || '',
      client_name:      data.client_name      || '',
      client_email:     data.client_email     || '',
      status:           data.status           || 'new',
      category:         data.category         || '',
      eventName:        data.eventName || data.name || 'האירוע שלי',
      eventType:        toStr(data.eventType),
      date:             toStr(data.date),
      guestCount:       toStr(data.guestCount),
      location:         toStr(data.location),
      budgetRange:      toStr(data.budgetRange),
      matchScore:       typeof data.matchScore === 'number' ? data.matchScore : 0,
      heroImage:        data.heroImage        || '',
      client_photo_url: data.client_photo_url || '',
      tasteProfile:     Array.isArray(data.tasteProfile) ? data.tasteProfile : [],
      evoNote:          data.evoNote          || '',
      suggestedPackage: data.suggestedPackage || null,
      suggestedPrice:   typeof data.suggestedPrice === 'number' ? data.suggestedPrice : null,
      expiresIn:        data.expiresIn        || null,
      order_items:      Array.isArray(data.order_items) ? data.order_items : [],
      order_total:      typeof data.order_total === 'number' ? data.order_total : 0,
    }
  }

  // ── Request browser notification permission ───────────────────
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const showLeadNotification = (lead) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification('ליד חדש ב-EVO! 🎉', {
      body: `${lead.client_name || 'לקוח'} מחפש ${lead.category || 'שירות'} לאירוע`,
      icon: '/favicon.ico',
    })
  }

  // ── Real-time leads listener ───────────────────────────────────
  const listenLeads = (uid) => {
    const q = query(collection(db, 'leads'), where('vendor_id', '==', uid))
    const knownIds = new Set()
    let isFirst = true

    const unsub = onSnapshot(q, async (snap) => {
      const normalized = snap.docs.map(d => normalizeLead(d.id, d.data()))

      // Backfill client photos
      const missingPhoto = normalized.filter(l => !l.client_photo_url && l.client_id)
      const uniqueClientIds = [...new Set(missingPhoto.map(l => l.client_id))]
      const photoMap = {}
      await Promise.all(uniqueClientIds.map(async (clientId) => {
        try {
          const userSnap = await getDoc(doc(db, 'users', clientId))
          if (userSnap.exists()) {
            const data = userSnap.data()
            photoMap[clientId] = data.photoURL || data.profile_photo_url || data.photo_url || ''
          }
        } catch {}
      }))

      const withPhotos = normalized.map(l =>
        (!l.client_photo_url && photoMap[l.client_id])
          ? { ...l, client_photo_url: photoMap[l.client_id] }
          : l
      )

      // Show notification for new leads (not on first load)
      if (!isFirst) {
        withPhotos.forEach(lead => {
          if (!knownIds.has(lead.id) && lead.status === 'new') {
            showLeadNotification(lead)
          }
        })
      }

      withPhotos.forEach(l => knownIds.add(l.id))
      isFirst = false
      setLeads(withPhotos)
    }, (err) => {
      console.error('שגיאה בטעינת לידים:', err)
    })

    return unsub
  }

  // ── Retry loading after timeout/failure ──────────────────────
  const retryLoadData = async () => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const success = await loadSupplierData(uid)
    if (success) {
      setScreen('home')
      setActiveTab('home')
    }
  }

  // ── Package CRUD ──────────────────────────────────────────────
  const savePackage = async (packageData) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('לא מחובר')

    const pkgId = packageData.id || `pkg-${Date.now()}`
    const payload = {
      id:           pkgId,
      vendor_id:    uid,
      name:         packageData.name || '',
      description:  packageData.description || '',
      price:        parseFloat(packageData.price) || 0,
      price_type:   packageData.price_type || 'fixed',
      min_guests:   parseInt(packageData.min_guests) || 0,
      max_guests:   parseInt(packageData.max_guests) || 0,
      min_hours:    parseInt(packageData.min_hours) || 0,
      is_popular:   packageData.is_popular || false,
      badge:        packageData.badge ?? (packageData.is_popular ? 'most_popular' : null),
      image_url:    packageData.image_url || null,
      is_available: packageData.is_available !== false,
      sort_order:   packageData.sort_order || 0,
      created_at:   packageData.created_at || serverTimestamp(),
    }

    await setDoc(doc(db, 'vendors', uid, 'packages', pkgId), payload)

    setPackages(prev => {
      const exists = prev.find(p => p.id === pkgId)
      const updated = exists
        ? prev.map(p => p.id === pkgId ? payload : p)
        : [...prev, payload]

      // Update _minPrice / _maxPrice on the vendor doc so the client can show price ranges
      const prices = updated.filter(p => p.is_available !== false).map(p => parseFloat(p.price) || 0).filter(n => n > 0)
      if (prices.length > 0) {
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        updateDoc(doc(db, 'vendors', uid), { _minPrice: minPrice, _maxPrice: maxPrice }).catch(() => {})
        setVendorData(prev => prev ? { ...prev, _minPrice: minPrice, _maxPrice: maxPrice } : prev)
      }

      return updated
    })
  }

  const deletePackage = async (packageId) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('לא מחובר')
    await deleteDoc(doc(db, 'vendors', uid, 'packages', packageId))
    setPackages(prev => {
      const updated = prev.filter(p => p.id !== packageId)
      const prices = updated.filter(p => p.is_available !== false).map(p => parseFloat(p.price) || 0).filter(n => n > 0)
      if (prices.length > 0) {
        updateDoc(doc(db, 'vendors', uid), { _minPrice: Math.min(...prices), _maxPrice: Math.max(...prices) }).catch(() => {})
        setVendorData(prev => prev ? { ...prev, _minPrice: Math.min(...prices), _maxPrice: Math.max(...prices) } : prev)
      } else {
        updateDoc(doc(db, 'vendors', uid), { _minPrice: null, _maxPrice: null }).catch(() => {})
        setVendorData(prev => prev ? { ...prev, _minPrice: null, _maxPrice: null } : prev)
      }
      return updated
    })
  }

  // ── Product CRUD ──────────────────────────────────────────────
  const saveProduct = async (productData) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('לא מחובר')

    const prodId = productData.id || `prod-${Date.now()}`
    const payload = {
      id:           prodId,
      vendor_id:    uid,
      name:         productData.name || '',
      description:  productData.description || '',
      category:     productData.category || '',
      price:        parseFloat(productData.price) || 0,
      price_type:   productData.price_type || 'fixed',
      min_hours:    parseInt(productData.min_hours) || 0,
      max_guests:   parseInt(productData.max_guests) || 0,
      is_available: productData.is_available !== false,
      sort_order:   productData.sort_order || 0,
      created_at:   productData.created_at || serverTimestamp(),
    }

    await setDoc(doc(db, 'vendors', uid, 'products', prodId), payload)

    setProducts(prev => {
      const exists = prev.find(p => p.id === prodId)
      return exists
        ? prev.map(p => p.id === prodId ? payload : p)
        : [...prev, payload]
    })
  }

  const deleteProduct = async (productId) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('לא מחובר')
    await deleteDoc(doc(db, 'vendors', uid, 'products', productId))
    setProducts(prev => prev.filter(p => p.id !== productId))
  }

  // ── Pricing rule CRUD ─────────────────────────────────────────
  const savePricingRule = async (ruleData) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('לא מחובר')

    const ruleId = ruleData.id || `rule-${Date.now()}`
    const payload = {
      id:               ruleId,
      vendor_id:        uid,
      rule_type:        ruleData.rule_type || '',
      adjustment_type:  ruleData.adjustment_type || 'percent',
      adjustment_value: parseFloat(ruleData.adjustment_value) || 0,
      valid_from:       ruleData.valid_from || null,
      valid_until:      ruleData.valid_until || null,
      notes:            ruleData.notes || '',
    }

    await setDoc(doc(db, 'vendors', uid, 'pricing_rules', ruleId), payload)

    setPricingRules(prev => {
      const exists = prev.find(r => r.id === ruleId)
      return exists
        ? prev.map(r => r.id === ruleId ? payload : r)
        : [...prev, payload]
    })
  }

  // ── Vendor profile update (allowed fields only) ───────────────
  const updateVendorProfile = async (profileData) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('לא מחובר')

    // Strip admin-only fields — client cannot write these
    const {
      is_approved, is_active, verification_status,
      avg_rating, total_events, total_revenue, total_reviews,
      response_rate, cancellation_rate, repeat_client_rate,
      ...allowedData
    } = profileData

    await updateDoc(doc(db, 'vendors', uid), allowedData)
    setVendorData(prev => ({ ...prev, ...allowedData }))
  }

  // Legacy saveCatalog — kept for backward compat in PackageForm/Catalog
  // It now saves each package individually to the sub-collection
  const saveCatalog = async (newCatalog) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('לא מחובר')
    for (const pkg of newCatalog) {
      await savePackage(pkg)
    }
    // Remove packages not in newCatalog
    const newIds = new Set(newCatalog.map(p => p.id))
    for (const pkg of packages) {
      if (!newIds.has(pkg.id)) {
        await deletePackage(pkg.id)
      }
    }
  }

  // ── Auth listener ─────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser)
        if (firebaseUser) {
          setAuthLoading(true)
          let hasDoc = false
          let loadError = false
          try {
            hasDoc = await Promise.race([
              loadSupplierData(firebaseUser.uid),
              new Promise((resolve) => setTimeout(() => resolve('timeout'), 8000))
            ])
            if (hasDoc === 'timeout') {
              hasDoc = false
              loadError = true
            }
          } catch (e) {
            console.error('loadSupplierData failed:', e)
            loadError = true
          }

          if (hasDoc === true) {
            // Load events in background, start real-time leads listener
            loadEvents(firebaseUser.uid).catch(() => {})
            listenLeads(firebaseUser.uid)
            requestNotificationPermission()
            setScreen('home')
            setActiveTab('home')
          } else if (loadError) {
            // Firestore unreachable — still go home since user is authenticated
            setScreen('home')
            setActiveTab('home')
          } else {
            // hasDoc === false means no vendor doc — check if admin before onboarding
            try {
              const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
              const vendorSnap = await getDoc(doc(db, 'vendors', firebaseUser.uid))
              const adminFound =
                (userSnap.exists()   && userSnap.data().is_admin   === true) ||
                (vendorSnap.exists() && vendorSnap.data().is_admin === true)
              if (adminFound) {
                setScreen('admin')
              } else {
                setScreen('onboarding')
              }
            } catch {
              setScreen('onboarding')
            }
          }
        } else {
          setVendorData(null)
          setPackages([])
          setProducts([])
          setPricingRules([])
          setEvents([])
          setLeads([])
          setScreen('entry')
        }
      } catch (e) {
        console.error('onAuthStateChanged error:', e)
        setScreen('entry')
      } finally {
        setAuthLoading(false)
      }
    })
    return unsub
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('שגיאה ביציאה:', err)
    }
  }

  const value = {
    screen, navigate,
    activeTab, goTab,
    leads, setLeads, acceptLead, declineLead,
    events,
    // New schema context
    vendorData, setVendorData,
    packages, setPackages,
    products: products, setProducts,
    pricingRules, setPricingRules,
    loadingData,
    firestoreBlocked,
    retryLoadData,
    savePackage, deletePackage,
    saveProduct, deleteProduct,
    savePricingRule,
    updateVendorProfile,
    // Legacy aliases for backward compat
    supplierData,
    supplierName, setSupplierName,
    catalog, saveCatalog,
    activeLead, setActiveLead,
    activeEvent, setActiveEvent,
    editPackage, setEditPackage,
    newLeadCount,
    user, setUser,
    loadSupplierData,
    loadEvents,
    logout,
    authLoading,
  }

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>
}

export function useSupplier() {
  const ctx = useContext(SupplierContext)
  if (!ctx) throw new Error('useSupplier must be inside SupplierProvider')
  return ctx
}
