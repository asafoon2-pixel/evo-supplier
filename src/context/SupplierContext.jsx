import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  collection, query, where, serverTimestamp, orderBy,
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

  const TAB_SCREENS = ['home', 'calendar', 'events', 'catalog', 'profile']
  const navigate = (s) => { setScreen(s); if (TAB_SCREENS.includes(s)) setActiveTab(s) }
  const goTab    = (tab) => { setActiveTab(tab); setScreen(tab) }

  const acceptLead = async (id) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'booked' } : l))
    try {
      await updateDoc(doc(db, 'leads', id), { status: 'booked', updated_at: serverTimestamp() })
    } catch (err) {
      console.error('acceptLead Firestore error:', err)
    }
  }

  const declineLead = async (id) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'declined' } : l))
    try {
      await updateDoc(doc(db, 'leads', id), { status: 'declined', updated_at: serverTimestamp() })
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

  // ── Load leads from Firestore ─────────────────────────────────
  const loadLeads = async (uid) => {
    try {
      const q = query(collection(db, 'leads'), where('vendor_id', '==', uid))
      const snap = await getDocs(q)
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('שגיאה בטעינת לידים:', err)
      // Non-fatal — leads stay empty
    }
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
      is_available: packageData.is_available !== false,
      sort_order:   packageData.sort_order || 0,
      created_at:   packageData.created_at || serverTimestamp(),
    }

    await setDoc(doc(db, 'vendors', uid, 'packages', pkgId), payload)

    setPackages(prev => {
      const exists = prev.find(p => p.id === pkgId)
      return exists
        ? prev.map(p => p.id === pkgId ? payload : p)
        : [...prev, payload]
    })
  }

  const deletePackage = async (packageId) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('לא מחובר')
    await deleteDoc(doc(db, 'vendors', uid, 'packages', packageId))
    setPackages(prev => prev.filter(p => p.id !== packageId))
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
            // Load events + leads in background (non-blocking)
            loadEvents(firebaseUser.uid).catch(() => {})
            loadLeads(firebaseUser.uid).catch(() => {})
            setScreen('home')
            setActiveTab('home')
          } else if (loadError) {
            // Firestore unreachable — still go home since user is authenticated
            setScreen('home')
            setActiveTab('home')
          } else {
            // hasDoc === false means no vendor doc exists → onboarding
            setScreen('onboarding')
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
