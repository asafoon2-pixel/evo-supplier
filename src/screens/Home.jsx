import { motion } from 'framer-motion'
import { ArrowRight, Clock, TrendingUp, Star, ChevronRight } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { supplierProfile, insights } from '../data/index'

export default function Home() {
  const { leads, events, goTab, setActiveLead, setActiveEvent, navigate } = useSupplier()

  const newLeads    = leads.filter(l => l.status === 'new')
  const activeEvts  = events.filter(e => e.status !== 'completed')
  const urgentEvent = activeEvts.find(e => e.timeline?.some(t => t.urgent))

  const fmt = (n) => n >= 1000 ? `₪${(n / 1000).toFixed(0)}K` : `₪${n}`

  return (
    <div className="w-full min-h-screen bg-evo-black pb-24 overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-evo-accent mb-1">EVO Partners</p>
            <h1 className="text-xl font-light text-white">Good morning, Maya</h1>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-evo-accent/30">
            <img src={supplierProfile.avatar} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'This month', value: fmt(insights.thisMonth.revenue), sub: `${insights.thisMonth.booked} events` },
            { label: 'New leads', value: newLeads.length, sub: 'waiting for you', accent: newLeads.length > 0 },
            { label: 'Rating', value: `${supplierProfile.rating}★`, sub: `${supplierProfile.reviewCount} reviews` },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} className={`bg-evo-card rounded-2xl border p-4 ${accent ? 'border-evo-accent/40' : 'border-evo-border'}`}>
              <p className="text-evo-muted text-[10px] tracking-wide mb-1">{label}</p>
              <p className={`text-lg font-semibold leading-tight ${accent ? 'text-evo-accent' : 'text-white'}`}>{value}</p>
              <p className="text-evo-dim text-[10px] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New leads alert */}
      {newLeads.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-6 mb-5">
          <button onClick={() => goTab('leads')}
            className="w-full bg-evo-accent/10 border border-evo-accent/40 rounded-2xl p-5 flex items-center gap-4 hover:bg-evo-accent/15 transition-all active:scale-[0.99]">
            <div className="w-10 h-10 rounded-full bg-evo-accent/20 flex items-center justify-center shrink-0">
              <span className="text-evo-accent font-semibold text-sm">{newLeads.length}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-medium">
                {newLeads.length === 1 ? 'New lead waiting' : `${newLeads.length} new leads waiting`}
              </p>
              <p className="text-evo-muted text-xs mt-0.5 font-light">
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
          <div className="bg-evo-card border border-evo-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">Action required</p>
              <p className="text-evo-muted text-xs mt-0.5 truncate">
                {urgentEvent.timeline.find(t => t.urgent)?.label} — {urgentEvent.name}
              </p>
            </div>
            <button onClick={() => { setActiveEvent(urgentEvent); navigate('eventDetail') }}
              className="shrink-0 text-evo-muted hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {activeEvts.length > 0 && (
        <div className="mb-5">
          <div className="px-6 flex items-center justify-between mb-3">
            <p className="text-xs tracking-[0.2em] uppercase text-evo-muted">Upcoming Events</p>
            <button onClick={() => goTab('events')} className="text-evo-accent text-xs hover:text-evo-accent/80 transition-colors">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pl-6 pr-6 pb-2 no-scrollbar">
            {activeEvts.map(evt => (
              <button key={evt.id}
                onClick={() => { setActiveEvent(evt); navigate('eventDetail') }}
                className="shrink-0 w-52 bg-evo-card rounded-2xl border border-evo-border overflow-hidden text-left hover:border-evo-accent/30 transition-all active:scale-[0.98]">
                <div className="h-28 relative overflow-hidden">
                  <img src={evt.heroImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${evt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-evo-accent/20 text-evo-accent'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${evt.status === 'confirmed' ? 'bg-green-400' : 'bg-evo-accent'}`} />
                      {evt.status === 'confirmed' ? 'Confirmed' : 'In progress'}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-medium leading-tight truncate">{evt.name}</p>
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
          <p className="text-xs tracking-[0.2em] uppercase text-evo-muted">Recent Leads</p>
          <button onClick={() => goTab('leads')} className="text-evo-accent text-xs">See all</button>
        </div>
        <div className="space-y-2">
          {leads.slice(0, 3).map(lead => {
            const color = lead.status === 'new' ? 'text-evo-accent bg-evo-accent/10 border-evo-accent/30' :
                          lead.status === 'booked' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                          'text-evo-muted bg-evo-card border-evo-border'
            const label = lead.status === 'new' ? 'New' : lead.status === 'booked' ? 'Booked' :
                          lead.status === 'viewed' ? 'Viewed' : 'Declined'
            return (
              <button key={lead.id}
                onClick={() => { setActiveLead(lead); navigate('leadDetail') }}
                className="w-full bg-evo-card rounded-2xl border border-evo-border p-4 flex items-center gap-4 text-left hover:border-evo-border/70 transition-all active:scale-[0.99]">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-evo-elevated shrink-0">
                  <img src={lead.heroImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{lead.eventType}</p>
                  <p className="text-evo-muted text-xs mt-0.5">{lead.date} · {lead.guestCount} guests</p>
                </div>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${color} shrink-0`}>{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
