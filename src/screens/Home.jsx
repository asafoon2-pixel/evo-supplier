import { motion } from 'framer-motion'
import { ArrowLeft, Clock, ChevronLeft, RefreshCw, Bell } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { LangToggle } from '../context/LanguageContext'

const f = (i) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
})

// ── Stat card ─────────────────────────────────────────────
function StatCard({ label, value, sub, bg, textColor, delay }) {
  return (
    <motion.div {...f(delay)}
      className="flex-1 rounded-card p-4 dot-texture"
      style={{ background: bg, boxShadow: '0 4px 16px rgba(44,32,22,0.1)' }}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
        style={{ color: `${textColor}99` }}>{label}</p>
      <p className="text-2xl font-black leading-none mb-0.5"
        style={{ color: textColor }}>{value}</p>
      <p className="text-[10px] font-medium" style={{ color: `${textColor}88` }}>{sub}</p>
    </motion.div>
  )
}

export default function Home() {
  const {
    leads, events, goTab, setActiveLead, setActiveEvent,
    navigate, vendorData, packages, retryLoadData, loadingData,
  } = useSupplier()

  const newLeads    = leads.filter(l => l.status === 'new')
  const activeEvts  = events.filter(e => e.status !== 'completed')
  const urgentEvent = activeEvts.find(e => e.timeline?.some(t => t.urgent))

  const displayName  = vendorData?.business_name || vendorData?.owner_full_name || 'שלום'
  const avatarUrl    = vendorData?.profile_photo_url || null
  const totalEvents  = vendorData?.total_events || 0

  return (
    <div className="w-full min-h-screen bg-evo-bg pb-24">

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        {...f(0)}
        className="px-6 pt-8 pb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #3D2B7A 0%, #6B5FE4 100%)' }}
      >
        {/* Dot texture overlay */}
        <div className="absolute inset-0 dot-texture opacity-20 pointer-events-none" />

        <div className="relative flex items-center justify-between mb-6">
          <LangToggle />
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Bell size={18} color="white" />
          </button>
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>
              ברוך הבא 👋
            </p>
            <h1 className="text-[26px] font-black text-white leading-tight"
              style={{ letterSpacing: '-0.5px' }}>
              {displayName}
            </h1>
          </div>
          {avatarUrl ? (
            <div className="w-12 h-12 rounded-full overflow-hidden"
              style={{ border: '2.5px solid rgba(255,255,255,0.4)' }}>
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', border: '2.5px solid rgba(255,255,255,0.35)' }}>
              <span className="text-white font-black text-lg">
                {(displayName || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Loading banner ──────────────────────────────────── */}
      {!vendorData && (
        <motion.div {...f(1)} className="px-5 pt-4">
          <div className="rounded-card p-4 flex items-center gap-3"
            style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0', boxShadow: '0 4px 20px rgba(44,32,22,0.08)' }}>
            <p className="text-evo-muted text-xs font-semibold flex-1">
              {loadingData ? 'טוען נתונים...' : 'לא ניתן לטעון נתונים. בדוק חיבור ונסה שנית.'}
            </p>
            <button onClick={retryLoadData} disabled={loadingData}
              className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ background: '#F0EBE1', border: '1.5px solid #C8BFB0' }}>
              <RefreshCw size={13} className={`text-evo-accent ${loadingData ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="px-5 mt-5 flex gap-3">
        <StatCard label="אירועים" value={totalEvents} sub="עד היום"
          bg="linear-gradient(135deg,#6B5FE4,#3D2B7A)" textColor="#fff" delay={1} />
        <StatCard label="לידים חדשים" value={newLeads.length} sub="ממתינים"
          bg="linear-gradient(135deg,#4A9E72,#2E7A54)" textColor="#fff" delay={2} />
        <StatCard label="חבילות" value={packages.length} sub="קטלוג שלי"
          bg="linear-gradient(135deg,#E8B86D,#E8A030)" textColor="#5C3D00" delay={3} />
      </div>

      {/* ── New leads alert ─────────────────────────────────── */}
      {newLeads.length > 0 && (
        <motion.div {...f(4)} className="px-5 mt-4">
          <button onClick={() => goTab('events')}
            className="w-full rounded-card p-5 flex items-center gap-4 transition-all active:scale-[0.98]"
            style={{ background: '#FDFAF5', border: '1.5px solid #C8BFB0', boxShadow: '0 4px 20px rgba(44,32,22,0.08)' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#6B5FE4,#3D2B7A)' }}>
              <span className="text-white font-black text-base">{newLeads.length}</span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-evo-text text-sm font-bold">
                {newLeads.length === 1 ? 'ליד חדש מחכה לך' : `${newLeads.length} לידים חדשים מחכים לך`}
              </p>
              <p className="text-evo-muted text-xs mt-0.5">
                פג תוקף ב-{newLeads[0]?.expiresIn} — ענה עכשיו
              </p>
            </div>
            <ArrowLeft size={16} className="text-evo-accent shrink-0" />
          </button>
        </motion.div>
      )}

      {/* ── Urgent action ───────────────────────────────────── */}
      {urgentEvent && (
        <motion.div {...f(5)} className="px-5 mt-4">
          <div className="rounded-card p-4 flex items-center gap-4"
            style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0', boxShadow: '0 4px 20px rgba(44,32,22,0.08)' }}>
            <div className="w-10 h-10 rounded-[16px] flex items-center justify-center shrink-0"
              style={{ background: 'rgba(232,160,48,0.12)' }}>
              <Clock size={18} style={{ color: '#E8A030' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-evo-text text-sm font-bold">נדרשת פעולה</p>
              <p className="text-evo-muted text-xs mt-0.5 truncate">
                {urgentEvent.timeline?.find(t => t.urgent)?.label} — {urgentEvent.name}
              </p>
            </div>
            <button onClick={() => { setActiveEvent(urgentEvent); navigate('eventDetail') }}
              className="text-evo-muted transition-colors">
              <ChevronLeft size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Upcoming events ─────────────────────────────────── */}
      {activeEvts.length > 0 && (
        <div className="mt-6">
          <motion.div {...f(5)} className="px-5 flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-wider text-evo-muted">אירועים קרובים</p>
            <button onClick={() => goTab('events')}
              className="text-xs font-bold text-evo-accent">הכל</button>
          </motion.div>
          <div className="flex gap-4 overflow-x-auto pr-5 pl-5 pb-2 no-scrollbar">
            {activeEvts.map((evt, i) => (
              <motion.button
                key={evt.id}
                {...f(6 + i)}
                onClick={() => { setActiveEvent(evt); navigate('eventDetail') }}
                className="shrink-0 w-52 rounded-card overflow-hidden text-right transition-all active:scale-[0.97]"
                style={{ background: '#FDFAF5', boxShadow: '0 4px 20px rgba(44,32,22,0.1)' }}
              >
                <div className="h-28 relative overflow-hidden">
                  <img src={evt.heroImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute bottom-2.5 right-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[10px] font-bold"
                      style={{
                        background: evt.status === 'confirmed' ? 'rgba(74,158,114,0.85)' : 'rgba(107,95,228,0.85)',
                        color: '#fff',
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      {evt.status === 'confirmed' ? 'מאושר' : 'בתהליך'}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-evo-text text-xs font-bold leading-tight truncate">{evt.name}</p>
                  <p className="text-evo-muted text-[10px] mt-1">{evt.date} · {evt.guestCount} אורחים</p>
                  <p className="text-xs font-bold mt-1.5" style={{ color: '#4A9E72' }}>
                    ₪{evt.totalValue?.toLocaleString()}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent leads ────────────────────────────────────── */}
      <div className="px-5 mt-6">
        <motion.div {...f(7)} className="flex items-center justify-between mb-3">
          <p className="text-xs font-black uppercase tracking-wider text-evo-muted">לידים אחרונים</p>
          {leads.length > 0 && (
            <button onClick={() => goTab('events')} className="text-xs font-bold text-evo-accent">הכל</button>
          )}
        </motion.div>

        {leads.length === 0 ? (
          <motion.div {...f(8)}
            className="rounded-card p-8 text-center"
            style={{ background: '#FDFAF5', boxShadow: '0 4px 20px rgba(44,32,22,0.06)' }}>
            {/* Illustrated empty state */}
            <div className="flex justify-center mb-4">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#F0EBE1"/>
                <path d="M18 36 Q28 22 38 36" stroke="#C8BFB0" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <circle cx="22" cy="26" r="3" fill="#C8BFB0"/>
                <circle cx="34" cy="26" r="3" fill="#C8BFB0"/>
                <path d="M24 40h8" stroke="#E8B86D" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-evo-text text-sm font-bold mb-1">עדיין אין לידים</p>
            <p className="text-evo-muted text-xs leading-relaxed">EVO ישלח לך לידים מותאמים בקרוב</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {leads.slice(0, 3).map((lead, i) => {
              const statusStyle =
                lead.status === 'new'     ? { bg: 'rgba(107,95,228,0.12)', color: '#6B5FE4', label: 'חדש' } :
                lead.status === 'booked'  ? { bg: 'rgba(74,158,114,0.12)',  color: '#4A9E72', label: 'הוזמן' } :
                lead.status === 'viewed'  ? { bg: 'rgba(232,160,48,0.12)',  color: '#E8A030', label: 'נצפה' } :
                                           { bg: 'rgba(212,96,122,0.12)',   color: '#D4607A', label: 'נדחה' }

              return (
                <motion.button
                  key={lead.id}
                  {...f(8 + i)}
                  onClick={() => { setActiveLead(lead); navigate('leadDetail') }}
                  className="w-full rounded-card p-4 flex items-center gap-4 text-right transition-all active:scale-[0.98]"
                  style={{ background: '#FDFAF5', boxShadow: '0 4px 20px rgba(44,32,22,0.06)' }}
                >
                  <div className="w-12 h-12 rounded-[16px] overflow-hidden shrink-0"
                    style={{ background: '#EDE8DF' }}>
                    {lead.heroImage && (
                      <img src={lead.heroImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-evo-text text-sm font-bold truncate">{lead.eventType}</p>
                    <p className="text-evo-muted text-xs mt-0.5">{lead.date} · {lead.guestCount} אורחים</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-pill shrink-0"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    {statusStyle.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
