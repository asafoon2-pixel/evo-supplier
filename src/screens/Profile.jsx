import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, Clock, Award, ChevronRight, LogOut, Shield, Bell, HelpCircle } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

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
      <div className="flex-1 text-left">
        <p className={`text-sm font-medium ${danger ? 'text-evo-red' : 'text-evo-text'}`}>{label}</p>
        {sublabel && <p className="text-evo-muted text-xs mt-0.5">{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={14} className="text-evo-dim" />}
    </button>
  )
}

export default function Profile() {
  const { navigate, vendorData, user, logout, packages } = useSupplier()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
      {/* Cover placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-[#2D1B8A] to-[#6C5CE7]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
      </div>

      {/* Avatar + identity */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl border-[3px] border-white overflow-hidden bg-evo-elevated flex items-center justify-center"
            style={{ boxShadow: 'rgba(45,27,105,0.15) 0px 4px 16px' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={ownerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-evo-purple text-3xl font-extrabold">{initial}</span>
            )}
          </div>
          <div className="pb-1">
            {category && <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent">{category}</p>}
            <h1 className="text-[22px] font-extrabold text-evo-text leading-tight" style={{ letterSpacing: '-0.5px' }}>{name}</h1>
            {ownerName && <p className="text-evo-muted text-sm">{ownerName}</p>}
          </div>
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
        {bio ? (
          <div className="mb-5">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-3">אודות</p>
            <p className="text-evo-muted text-sm leading-relaxed">{bio}</p>
          </div>
        ) : null}

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
          <MenuItem icon={Bell} label="התראות" sublabel="לידים, בריפים, תשלומים" />
          <MenuItem icon={Shield} label="חשבון ואבטחה" sublabel="סיסמה, אימייל" />
          <MenuItem icon={HelpCircle} label="עזרה ותמיכה" sublabel="שאלות נפוצות, יצירת קשר עם EVO" />
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
    </div>
  )
}
