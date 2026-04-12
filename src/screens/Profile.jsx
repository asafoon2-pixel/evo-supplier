import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, Clock, Award, ChevronRight, LogOut, Shield, Bell, HelpCircle, Camera, Pencil, Check, X, ChevronDown, MessageCircle, Mail } from 'lucide-react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import { useSupplier } from '../context/SupplierContext'

function compressImage(file, maxPx = 400, quality = 0.65) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onerror = () => resolve(null)
    reader.onload = (ev) => {
      const img = new Image()
      img.onerror = () => resolve(null)
      img.onload = () => {
        try {
          const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
          const canvas = document.createElement('canvas')
          canvas.width  = Math.round(img.width  * scale)
          canvas.height = Math.round(img.height * scale)
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch { resolve(null) }
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}

function StatPill({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-evo-text text-xl font-bold">{value}</p>
      <p className="text-evo-muted text-xs mt-0.5">{label}</p>
    </div>
  )
}

function MenuItem({ icon: Icon, label, sublabel, onPress, danger }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-4 py-4 border-b border-evo-border last:border-0"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-evo-red/10' : 'bg-evo-elevated'}`}>
        <Icon size={16} className={danger ? 'text-evo-red' : 'text-evo-muted'} />
      </div>
      <div className="flex-1 text-start">
        <p className={`text-sm font-medium ${danger ? 'text-evo-red' : 'text-evo-text'}`}>{label}</p>
        {sublabel && <p className="text-evo-muted text-xs mt-0.5">{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={14} className="text-evo-dim" />}
    </button>
  )
}

export default function Profile() {
  const { navigate, vendorData, user, logout, packages, updateVendorProfile } = useSupplier()
  const [showLogoutConfirm, setShowLogoutConfirm]     = useState(false)
  const [showNotifications, setShowNotifications]     = useState(false)
  const [showAccount, setShowAccount]                 = useState(false)
  const [showHelp, setShowHelp]                       = useState(false)
  const [photoLoading, setPhotoLoading]               = useState(false)
  const [editingBio, setEditingBio]                   = useState(false)
  const [bioText, setBioText]                         = useState('')
  const [bioSaving, setBioSaving]                     = useState(false)

  // Notification toggles
  const [notifLeads, setNotifLeads]     = useState(true)
  const [notifEvents, setNotifEvents]   = useState(true)
  const [notifPayments, setNotifPayments] = useState(true)

  // Account sheet
  const [resetSent, setResetSent]       = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // Help FAQ
  const [openFaq, setOpenFaq]           = useState(null)

  const handlePasswordReset = async () => {
    if (!email) return
    setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setResetSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setResetLoading(false)
    }
  }

  const FAQ = [
    { q: 'איך מקבלים לידים?', a: 'EVO מתאים לידים לפי הקטגוריה, המיקום והחבילות שהגדרת. ודא שהפרופיל שלך מלא ומאושר.' },
    { q: 'מתי מקבלים תשלום?', a: 'התשלום מועבר לחשבון הבנק תוך 3–5 ימי עסקים לאחר אישור האירוע.' },
    { q: 'איך משנים חבילה?', a: 'נכנסים ל"קטלוג" בתפריט התחתון, בוחרים חבילה וניתן לערוך אותה.' },
    { q: 'מה זה ספק מאומת?', a: 'ספק שעבר בדיקת EVO — רישיון עסק, ביטוח ואיכות שירות. הסטטוס עולה את הדירוג בחיפוש.' },
    { q: 'איך יוצרים קשר עם EVO?', a: 'ניתן לשלוח WhatsApp למספר התמיכה או מייל — ראה כפתורים למטה.' },
  ]
  const photoInputRef = useRef()

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    try {
      let dataUrl = await compressImage(file)
      if (!dataUrl) {
        // fallback: read as-is
        dataUrl = await new Promise((res, rej) => {
          const r = new FileReader()
          r.onload = ev => res(ev.target.result)
          r.onerror = rej
          r.readAsDataURL(file)
        })
      }
      await updateVendorProfile({ profile_photo_url: dataUrl })
    } catch (err) {
      console.error('Photo update error:', err)
    } finally {
      setPhotoLoading(false)
      e.target.value = ''
    }
  }

  const name        = vendorData?.business_name || 'העסק שלי'
  const ownerName   = vendorData?.owner_full_name || ''
  const category    = vendorData?.category || ''
  const city        = vendorData?.city || ''
  const bio         = vendorData?.bio || ''
  const phone       = vendorData?.phone || ''
  const email       = vendorData?.email || user?.email || ''
  const instagram   = vendorData?.instagram_handle || ''
  const website     = vendorData?.website_url || ''
  const avatarUrl   = vendorData?.profile_photo_url || null
  const verStatus   = vendorData?.verification_status || 'pending'
  const isVerified  = verStatus === 'approved'
  const avgRating   = vendorData?.avg_rating || 0
  const totalReviews = vendorData?.total_reviews || 0
  const totalEvents = vendorData?.total_events || 0
  const initial     = (name || '?')[0].toUpperCase()

  const handleLogout = async () => {
    await logout()
    // onAuthStateChanged in context will reset to entry screen
  }

  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-[#2D1B8A] to-[#6C5CE7]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      {/* Avatar — straddles the cover */}
      <div className="px-6 -mt-10 relative z-10 mb-3">
        <div className="relative w-20 h-20">
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <div className="w-20 h-20 rounded-2xl border-[3px] border-white overflow-hidden bg-evo-elevated flex items-center justify-center"
            style={{ boxShadow: 'rgba(45,27,105,0.18) 0px 4px 16px' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt={ownerName} className="w-full h-full object-cover" />
              : <span className="text-evo-purple text-3xl font-extrabold">{initial}</span>}
          </div>
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={photoLoading}
            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-evo-purple-mid border-2 border-white flex items-center justify-center disabled:opacity-50"
            style={{ boxShadow: '0 2px 8px rgba(45,27,105,0.3)' }}
          >
            {photoLoading
              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Camera size={13} className="text-white" />}
          </button>
        </div>
      </div>

      {/* Identity — fully below cover, always on white/light bg */}
      <div className="px-6">
        <div className="mb-4">
          {category && (
            <p className="text-[10px] font-extrabold tracking-[0.25em] uppercase mb-0.5" style={{ color: '#6C5CE7' }}>
              {category}
            </p>
          )}
          <h1 className="text-[22px] font-extrabold text-evo-text leading-tight" style={{ letterSpacing: '-0.5px' }}>
            {name}
          </h1>
          {ownerName && (
            <p className="text-[15px] font-medium text-evo-text/70 mt-0.5">{ownerName}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          {city && (
            <div className="flex items-center gap-1.5 text-evo-muted text-xs">
              <MapPin size={11} />
              <span>{city}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1.5 text-evo-muted text-xs">
              <Clock size={11} />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <p className="text-evo-muted text-xs">{email}</p>
          )}
          {avgRating > 0 && (
            <div className="flex items-center gap-1 text-evo-muted text-xs">
              <Star size={11} className="text-evo-accent fill-evo-accent" />
              <span>{avgRating.toFixed(1)} ({totalReviews})</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 flex items-center justify-around mb-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <StatPill label="חבילות" value={packages.length} />
          <div className="w-px h-8 bg-evo-border" />
          <StatPill label="אירועים" value={totalEvents} />
          <div className="w-px h-8 bg-evo-border" />
          <StatPill label="ביקורות" value={totalReviews} />
        </div>

        {/* About */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted">אודות</p>
            {!editingBio && (
              <button
                onClick={() => { setBioText(bio); setEditingBio(true) }}
                className="flex items-center gap-1 text-evo-purple-mid text-xs font-semibold"
              >
                <Pencil size={11} />
                עריכה
              </button>
            )}
          </div>
          {editingBio ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={bioText}
                onChange={e => setBioText(e.target.value.slice(0, 300))}
                rows={4}
                placeholder="ספר על העסק שלך..."
                autoFocus
                className="w-full bg-white border-[1.5px] border-evo-purple-mid rounded-xl px-4 py-3 text-evo-text text-sm placeholder-evo-dim focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-evo-muted">{bioText.length} / 300</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBio(false)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border-[1.5px] border-evo-border text-evo-muted text-xs font-semibold"
                  >
                    <X size={12} /> ביטול
                  </button>
                  <button
                    disabled={bioSaving}
                    onClick={async () => {
                      setBioSaving(true)
                      try { await updateVendorProfile({ bio: bioText }) } catch {}
                      setBioSaving(false)
                      setEditingBio(false)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold disabled:opacity-50"
                    style={{ background: '#2D1B8A' }}
                  >
                    {bioSaving ? 'שומר...' : <><Check size={12} /> שמירה</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className={`text-sm leading-relaxed ${bio ? 'text-evo-muted' : 'text-evo-dim italic'}`}>
              {bio || 'לחץ על עריכה כדי להוסיף תיאור...'}
            </p>
          )}
        </div>

        {/* EVO Status */}
        <div className="bg-white rounded-[20px] border-l-[3px] border-evo-accent border-[1.5px] border-evo-border p-4 mb-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-evo-accent" />
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent">
              {isVerified ? 'EVO מאומת' : 'ממתין לאימות'}
            </p>
          </div>
          <p className="text-evo-muted text-xs leading-relaxed">
            {isVerified
              ? 'הפרופיל שלך פעיל וגלוי למנוע ההתאמה של EVO.'
              : 'הפרופיל שלך בבדיקה. EVO יאמת אותו בקרוב ויפעיל אותך.'}
          </p>
        </div>

        {/* Settings menu */}
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border px-4 mb-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <MenuItem icon={Bell} label="התראות" sublabel="לידים, בריפים, תשלומים" onPress={() => setShowNotifications(true)} />
          <MenuItem icon={Shield} label="חשבון ואבטחה" sublabel="סיסמה, אימייל" onPress={() => setShowAccount(true)} />
          <MenuItem icon={HelpCircle} label="עזרה ותמיכה" sublabel="שאלות נפוצות, יצירת קשר עם EVO" onPress={() => setShowHelp(true)} />
          <MenuItem icon={LogOut} label="יציאה" danger onPress={() => setShowLogoutConfirm(true)} />
        </div>

        <p className="text-center text-evo-muted text-xs">EVO Supplier Platform · v1.0</p>
      </div>

      {/* Logout confirm sheet */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-6 pb-10"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-evo-text text-lg font-bold mb-2 text-center">יציאה מהחשבון?</p>
              <p className="text-evo-muted text-sm text-center mb-6">תצטרך להתחבר שוב בפעם הבאה</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl border-[1.5px] border-evo-border text-evo-text text-sm font-semibold"
                >
                  ביטול
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#EF4444' }}
                >
                  יציאה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notifications sheet ─────────────────────────── */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowNotifications(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-6 pb-10"
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-evo-border rounded-full mx-auto mb-5" />
              <p className="text-evo-text text-lg font-extrabold mb-1">התראות</p>
              <p className="text-evo-muted text-xs mb-5">בחר אילו התראות תרצה לקבל</p>
              {[
                { label: 'לידים חדשים', sub: 'כשמגיע ליד חדש שמתאים לך', val: notifLeads, set: setNotifLeads },
                { label: 'עדכוני אירועים', sub: 'שינויים בפרטי האירועים שלך', val: notifEvents, set: setNotifEvents },
                { label: 'תשלומים', sub: 'קבלה והעברת תשלומים', val: notifPayments, set: setNotifPayments },
              ].map(({ label, sub, val, set }) => (
                <div key={label} className="flex items-center justify-between py-4 border-b border-evo-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-evo-text">{label}</p>
                    <p className="text-xs text-evo-muted mt-0.5">{sub}</p>
                  </div>
                  <button onClick={() => set(v => !v)}
                    className="w-12 h-6 rounded-full transition-colors relative shrink-0"
                    style={{ background: val ? '#2D1B8A' : '#E8E8F0' }}>
                    <motion.div animate={{ x: val ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              ))}
              <button onClick={() => setShowNotifications(false)}
                className="w-full mt-5 py-3.5 rounded-xl bg-evo-elevated text-evo-text text-sm font-semibold">
                סגור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Account & Security sheet ────────────────────── */}
      <AnimatePresence>
        {showAccount && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowAccount(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-6 pb-10"
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-evo-border rounded-full mx-auto mb-5" />
              <p className="text-evo-text text-lg font-extrabold mb-4">חשבון ואבטחה</p>

              {/* Current email */}
              <div className="bg-evo-elevated rounded-xl px-4 py-3 mb-4">
                <p className="text-[10px] font-bold text-evo-muted uppercase tracking-wider mb-1">אימייל נוכחי</p>
                <p className="text-sm font-semibold text-evo-text">{email}</p>
              </div>

              {/* Reset password */}
              <div className="bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-4 mb-4">
                <p className="text-sm font-bold text-evo-text mb-1">שינוי סיסמה</p>
                <p className="text-xs text-evo-muted mb-3">נשלח לינק לאיפוס סיסמה לאימייל שלך</p>
                {resetSent ? (
                  <div className="flex items-center gap-2 text-evo-green text-sm font-semibold">
                    <Check size={14} /> נשלח! בדוק את תיבת הדואר שלך
                  </div>
                ) : (
                  <button onClick={handlePasswordReset} disabled={resetLoading}
                    className="w-full py-2.5 rounded-lg text-white text-sm font-bold disabled:opacity-50"
                    style={{ background: '#2D1B8A' }}>
                    {resetLoading ? 'שולח...' : 'שלח לינק לאיפוס סיסמה'}
                  </button>
                )}
              </div>

              <button onClick={() => { setShowAccount(false); setResetSent(false) }}
                className="w-full py-3.5 rounded-xl bg-evo-elevated text-evo-text text-sm font-semibold">
                סגור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Help & Support sheet ────────────────────────── */}
      <AnimatePresence>
        {showHelp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowHelp(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-evo-border rounded-full mx-auto mb-5" />
              <p className="text-evo-text text-lg font-extrabold mb-1">עזרה ותמיכה</p>
              <p className="text-evo-muted text-xs mb-5">שאלות נפוצות ויצירת קשר</p>

              {/* FAQ */}
              <div className="mb-5 space-y-2">
                {FAQ.map((item, i) => (
                  <div key={i} className="border-[1.5px] border-evo-border rounded-xl overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-start">
                      <p className="text-sm font-semibold text-evo-text">{item.q}</p>
                      <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} className="text-evo-muted shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          className="overflow-hidden">
                          <p className="px-4 pb-4 text-xs text-evo-muted leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <p className="text-[10px] font-bold text-evo-muted uppercase tracking-wider mb-3">צור קשר עם EVO</p>
              <div className="flex gap-3 mb-5">
                <a href="https://wa.me/972500000000" target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold"
                  style={{ background: '#25D366' }}>
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <a href="mailto:support@evo.co.il"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-[1.5px] border-evo-border text-evo-text">
                  <Mail size={15} /> מייל
                </a>
              </div>

              <button onClick={() => setShowHelp(false)}
                className="w-full py-3.5 rounded-xl bg-evo-elevated text-evo-text text-sm font-semibold">
                סגור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
