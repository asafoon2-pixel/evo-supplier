import { motion } from 'framer-motion'
import { ArrowRight, Clock, ChevronRight, RefreshCw } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

export default function Home() {
  const { leads, events, goTab, setActiveLead, setActiveEvent, navigate, vendorData, packages, retryLoadData, loadingData } = useSupplier()
  const newLeads    = leads.filter(l => l.status === 'new')
  const activeEvts  = events.filter(e => e.status !== 'completed')
  const urgentEvent = activeEvts.find(e => e.timeline?.some(t => t.urgent))

  const displayName = vendorData?.business_name || vendorData?.owner_full_name || 'שלום'
  const avatarUrl   = vendorData?.profile_photo_url || null
  const totalEvents = vendorData?.total_events || 0
  const totalReviews = vendorData?.total_reviews || 0

  return (
    <div className="w-full bg-evo-bg pb-8 overflow-y-auto">
      {/* Firestore loading banner */}
      {!vendorData && (
        <div className="px-6 pt-4 pb-2">
          <div className="bg-white rounded-[16px] border-[1.5px] border-evo-border px-4 py-3 flex items-center justify-between gap-3"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 8px' }}>
            <p className="text-evo-muted text-xs font-semibold flex-1">
              {loadingData ? 'טוען נתונים...' : 'לא ניתן לטעון נתונים. בדוק חיבור ונסה שנית.'}
            </p>
            <button
              onClick={retryLoadData}
              disabled={loadingData}
              className="shrink-0 w-8 h-8 rounded-full bg-evo-elevated border-[1.5px] border-evo-dim flex items-center justify-center disabled:opacity-40">
              <RefreshCw size={13} className={`text-evo-accent ${loadingData ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white border-b border-evo-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-evo-accent mb-1">EVO Partners</p>
            <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>
              שלום, {displayName}
            </h1>
          </div>
          {avatarUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-evo-dim">
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-evo-elevated border-2 border-evo-dim flex items-center justify-center">
              <span className="text-evo-purple font-bold text-sm">{(displayName || '?')[0].toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-6 mt-5 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'אירועים כולל', value: totalEvents, sub: 'עד היום' },
            { label: 'לידים חדשים', value: newLeads.length, sub: 'ממתינים לך', accent: newLeads.length > 0 },
            { label: 'חבילות', value: packages.length, sub: 'קטלוג שלי' },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} className={`bg-white rounded-[20px] border-[1.5px] p-4 ${accent ? 'border-evo-dim' : 'border-evo-border'}`}
              style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
              <p className="text-evo-muted text-[10px] tracking-wide mb-1">{label}</p>
              <p className={`text-lg font-semibold leading-tight ${accent ? 'text-evo-accent' : 'text-evo-text'}`}>{value}</p>
              <p className="text-evo-muted text-[10px] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New leads alert */}
      {newLeads.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-6 mb-5">
          <button onClick={() => goTab('leads')}
            className="w-full bg-evo-elevated border-[1.5px] border-evo-dim rounded-[20px] p-5 flex items-center gap-4 hover:border-evo-accent transition-all active:scale-[0.99]">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-evo-dim">
              <span className="text-evo-accent font-bold text-sm">{newLeads.length}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-evo-text text-sm font-semibold">
                {newLeads.length === 1 ? 'New lead waiting' : `${newLeads.length} new leads waiting`}
              </p>
              <p className="text-evo-muted text-xs mt-0.5">
                Expires in {newLeads[0].expiresIn} — respond to secure
              </p>
            </div>
            <ArrowRight size={16} className="text-evo-accent shrink-0" />
          </button>
        </motion.div>
      )}

      {/* Urgent action */}
      {urgentEvent && (
        <div className="px-6 mb-5">
          <div className="bg-white border-[1.5px] border-evo-border rounded-[20px] p-4 flex items-center gap-4"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-evo-text text-sm font-semibold">Action required</p>
              <p className="text-evo-muted text-xs mt-0.5 truncate">
                {urgentEvent.timeline.find(t => t.urgent)?.label} — {urgentEvent.name}
              </p>
            </div>
            <button onClick={() => { setActiveEvent(urgentEvent); navigate('eventDetail') }}
              className="shrink-0 text-evo-muted hover:text-evo-text transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {activeEvts.length > 0 && (
        <div className="mb-5">
          <div className="px-6 flex items-center justify-between mb-3">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted">Upcoming Events</p>
            <button onClick={() => goTab('events')} className="text-evo-accent text-xs font-medium hover:text-evo-purple-mid transition-colors">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pl-6 pr-6 pb-2 no-scrollbar">
            {activeEvts.map(evt => (
              <button key={evt.id}
                onClick={() => { setActiveEvent(evt); navigate('eventDetail') }}
                className="shrink-0 w-52 bg-white rounded-[20px] border-[1.5px] border-evo-border overflow-hidden text-left hover:border-evo-dim transition-all active:scale-[0.98]"
                style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
                <div className="h-28 relative overflow-hidden">
                  <img src={evt.heroImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${evt.status === 'confirmed' ? 'bg-evo-green/20 text-evo-green' : 'bg-evo-accent/20 text-evo-accent'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${evt.status === 'confirmed' ? 'bg-evo-green' : 'bg-evo-accent'}`} />
                      {evt.status === 'confirmed' ? 'Confirmed' : 'In progress'}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-evo-text text-xs font-semibold leading-tight truncate">{evt.name}</p>
                  <p className="text-evo-muted text-[10px] mt-1">{evt.date} · {evt.guestCount} guests</p>
                  <p className="text-evo-accent text-xs font-medium mt-1.5">₪{evt.totalValue.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent leads */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted">לידים אחרונים</p>
          {leads.length > 0 && (
            <button onClick={() => goTab('leads')} className="text-evo-accent text-xs font-medium">הכל</button>
          )}
        </div>
        {leads.length === 0 ? (
          <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-6 text-center"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
            <p className="text-2xl mb-2">📭</p>
            <p className="text-evo-text text-sm font-semibold mb-1">עדיין אין לידים</p>
            <p className="text-evo-muted text-xs">EVO ישלח לך לידים מותאמים בקרוב</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leads.slice(0, 3).map(lead => {
              const color = lead.status === 'new' ? 'text-evo-accent bg-evo-elevated border-evo-dim' :
                            lead.status === 'booked' ? 'text-evo-green bg-evo-green/10 border-evo-green/30' :
                            'text-evo-muted bg-evo-bg border-evo-border'
              const label = lead.status === 'new' ? 'חדש' : lead.status === 'booked' ? 'הוזמן' :
                            lead.status === 'viewed' ? 'נצפה' : 'נדחה'
              return (
                <button key={lead.id}
                  onClick={() => { setActiveLead(lead); navigate('leadDetail') }}
                  className="w-full bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 flex items-center gap-4 text-left hover:border-evo-dim transition-all active:scale-[0.99]"
                  style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-evo-elevated shrink-0">
                    {lead.heroImage && <img src={lead.heroImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-evo-text text-sm font-semibold truncate">{lead.eventType}</p>
                    <p className="text-evo-muted text-xs mt-0.5">{lead.date} · {lead.guestCount} guests</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border-[1.5px] ${color} shrink-0`}>{label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
