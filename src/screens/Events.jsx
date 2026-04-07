import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Zap } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const EVENT_STATUS = {
  confirmed:     { label: 'Confirmed',   color: 'text-evo-green bg-evo-green/10 border-evo-green/30' },
  'in-progress': { label: 'In Progress', color: 'text-evo-accent bg-evo-elevated border-evo-dim' },
  completed:     { label: 'Completed',   color: 'text-evo-muted bg-evo-bg border-evo-border' },
}

const LEAD_STATUS = {
  new:      { badge: 'text-evo-accent bg-evo-elevated border-evo-dim',              label: 'New' },
  viewed:   { badge: 'text-evo-muted bg-white border-evo-border',                   label: 'Viewed' },
  booked:   { badge: 'text-evo-green bg-evo-green/10 border-evo-green/30',          label: 'Booked' },
  declined: { badge: 'text-evo-muted bg-white border-evo-border',                   label: 'Declined' },
}

const LEAD_FILTERS = ['all', 'new', 'viewed', 'booked']

export default function Events() {
  const { events, leads, setActiveEvent, setActiveLead, navigate, newLeadCount } = useSupplier()
  const [mainTab,   setMainTab]   = useState('events')
  const [evtFilter, setEvtFilter] = useState('active')
  const [leadFilter, setLeadFilter] = useState('all')

  const filteredEvents = evtFilter === 'active'
    ? events.filter(e => e.status !== 'completed')
    : events.filter(e => e.status === 'completed')

  const filteredLeads = leadFilter === 'all'
    ? leads
    : leads.filter(l => l.status === leadFilter)

  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-evo-border">
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>
          {mainTab === 'events' ? 'Events' : 'Leads'}
        </h1>
        <p className="text-evo-muted text-sm mt-1 font-medium">
          {mainTab === 'events' ? 'Your active and completed bookings' : 'EVO-matched events for your profile'}
        </p>
      </div>

      {/* Main tabs: Events / Leads */}
      <div className="flex bg-white border-b border-evo-border px-6 gap-1">
        {[['events', 'Events'], ['leads', `Leads${newLeadCount > 0 ? ` (${newLeadCount})` : ''}`]].map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setMainTab(id)}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all ${
              mainTab === id
                ? 'text-evo-purple-mid border-evo-purple-mid'
                : 'text-evo-muted border-transparent'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* ── EVENTS TAB ── */}
      {mainTab === 'events' && (
        <>
          <div className="px-6 py-3 flex gap-2 bg-white border-b border-evo-border">
            {[['active', 'Active'], ['completed', 'Completed']].map(([id, lbl]) => (
              <button key={id} onClick={() => setEvtFilter(id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  evtFilter === id
                    ? 'bg-evo-purple-mid text-white'
                    : 'border-[1.5px] border-evo-border text-evo-muted'
                }`}>
                {lbl}
              </button>
            ))}
          </div>

          <div className="px-6 pt-4 space-y-3">
            {filteredEvents.map((evt, i) => {
              const s = EVENT_STATUS[evt.status] || EVENT_STATUS.completed
              return (
                <motion.button key={evt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => { setActiveEvent(evt); navigate('eventDetail') }}
                  className="w-full bg-white rounded-[20px] border-[1.5px] border-evo-border overflow-hidden text-left hover:border-evo-dim transition-all active:scale-[0.99]"
                  style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
                  <div className="relative h-32 overflow-hidden">
                    <img src={evt.heroImage} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border-[1.5px] ${s.color}`}>{s.label}</span>
                    </div>
                    {evt.status !== 'completed' && (
                      <div className="absolute bottom-3 left-4">
                        <span className="text-white text-2xl font-light">{evt.daysAway}</span>
                        <span className="text-white/70 text-xs ml-1.5">days away</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-evo-text text-sm font-bold leading-tight truncate">{evt.name}</p>
                      <p className="text-evo-muted text-xs font-medium mt-1">{evt.eventType} · {evt.date}</p>
                      <p className="text-evo-muted text-xs mt-0.5">{evt.location}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-evo-accent text-sm font-bold">₪{evt.totalValue.toLocaleString()}</span>
                        <span className="text-evo-muted text-xs">{evt.packageName} package</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-evo-dim shrink-0 mt-1" />
                  </div>
                </motion.button>
              )
            })}
            {filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">📅</p>
                <p className="text-evo-text text-sm font-semibold mb-1">עדיין אין אירועים</p>
                <p className="text-evo-muted text-xs">האירועים שלך יופיעו כאן לאחר הזמנה</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── LEADS TAB ── */}
      {mainTab === 'leads' && (
        <>
          <div className="flex gap-2 px-6 py-3 bg-white border-b border-evo-border overflow-x-auto no-scrollbar">
            {LEAD_FILTERS.map(f => (
              <button key={f} onClick={() => setLeadFilter(f)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${
                  leadFilter === f
                    ? 'bg-evo-purple-mid text-white'
                    : 'border-[1.5px] border-evo-border text-evo-muted'
                }`}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span className="ml-1 opacity-70">
                    {leads.filter(l => l.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="px-6 pt-4 space-y-3">
            {filteredLeads.map((lead, i) => {
              const s = LEAD_STATUS[lead.status] || LEAD_STATUS.viewed
              return (
                <motion.button key={lead.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setActiveLead(lead); navigate('leadDetail') }}
                  className="w-full rounded-[20px] border-[1.5px] border-evo-border bg-white overflow-hidden text-left hover:border-evo-dim transition-all active:scale-[0.99]"
                  style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>

                  <div className="relative h-36 overflow-hidden">
                    <img src={lead.heroImage} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <Zap size={11} className="text-evo-accent" />
                      <span className="text-white text-xs font-bold">{lead.matchScore}% match</span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border-[1.5px] ${s.badge}`}>{s.label}</span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="text-white text-sm font-bold leading-tight">{lead.eventName}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-3 text-xs text-evo-muted font-medium flex-wrap">
                      <span>{lead.eventType}</span>
                      <span className="w-1 h-1 rounded-full bg-evo-dim" />
                      <span>{lead.date}</span>
                      <span className="w-1 h-1 rounded-full bg-evo-dim" />
                      <span>{lead.guestCount} guests</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-evo-purple-mid text-sm font-bold">{lead.budgetRange}</span>
                      {lead.expiresIn && lead.status === 'new' && (
                        <span className="text-amber-600 text-xs font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Expires in {lead.expiresIn}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {lead.tasteProfile.map(tag => (
                        <span key={tag} className="text-[10px] font-semibold text-evo-purple bg-evo-elevated border-[1.5px] border-evo-dim rounded-full px-2.5 py-1">{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              )
            })}
            {filteredLeads.length === 0 && leads.length === 0 && (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-evo-text text-sm font-semibold mb-1">עדיין אין לידים</p>
                <p className="text-evo-muted text-xs">EVO ישלח לך לידים מותאמים בקרוב</p>
              </div>
            )}
            {filteredLeads.length === 0 && leads.length > 0 && (
              <div className="text-center py-16">
                <p className="text-evo-muted text-sm font-medium">אין לידים בקטגוריה זו</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
