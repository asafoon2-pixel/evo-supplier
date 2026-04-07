import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'new',     label: 'New' },
  { id: 'viewed',  label: 'Viewed' },
  { id: 'booked',  label: 'Booked' },
]

const STATUS_STYLE = {
  new:      { dot: 'bg-evo-accent',    badge: 'text-evo-accent bg-evo-elevated border-evo-dim',         label: 'New' },
  viewed:   { dot: 'bg-evo-muted',     badge: 'text-evo-muted bg-evo-bg border-evo-border',             label: 'Viewed' },
  booked:   { dot: 'bg-evo-green',     badge: 'text-evo-green bg-evo-green/10 border-evo-green/30',     label: 'Booked' },
  declined: { dot: 'bg-evo-dim',       badge: 'text-evo-muted bg-evo-bg border-evo-border',             label: 'Declined' },
}

export default function Leads() {
  const { leads, setActiveLead, navigate } = useSupplier()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  return (
    <div className="w-full bg-evo-bg pb-8 overflow-y-auto">
      <div className="px-6 pt-12 pb-5 bg-white border-b border-evo-border">
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>Leads</h1>
        <p className="text-evo-muted text-sm mt-1">EVO-matched events for your profile</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-6 py-4 overflow-x-auto no-scrollbar bg-white border-b border-evo-border">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              filter === f.id
                ? 'bg-evo-purple-mid text-white'
                : 'border-[1.5px] border-evo-border text-evo-muted hover:border-evo-dim hover:text-evo-text'
            }`}>
            {f.label}
            {f.id !== 'all' && (
              <span className="ml-1.5 opacity-60">{leads.filter(l => l.status === f.id).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="px-6 pt-4 space-y-3">
        {filtered.map((lead, i) => {
          const s = STATUS_STYLE[lead.status] || STATUS_STYLE.viewed
          return (
            <motion.button key={lead.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { setActiveLead(lead); navigate('leadDetail') }}
              className="w-full rounded-[20px] border-[1.5px] border-evo-border bg-white overflow-hidden text-left hover:border-evo-dim transition-all active:scale-[0.99]"
              style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>

              {/* Hero image strip */}
              <div className="relative h-36 overflow-hidden">
                <img src={lead.heroImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Match score */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
                  <Zap size={11} className="text-evo-accent" />
                  <span className="text-white text-xs font-semibold">{lead.matchScore}% match</span>
                </div>

                {/* Status */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border-[1.5px] ${s.badge}`}>{s.label}</span>
                </div>

                {/* Event name bottom */}
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white text-sm font-semibold leading-tight">{lead.eventName}</p>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex items-center gap-4 text-xs text-evo-muted flex-wrap">
                  <span>{lead.eventType}</span>
                  <span className="w-1 h-1 rounded-full bg-evo-dim" />
                  <span>{lead.date}</span>
                  <span className="w-1 h-1 rounded-full bg-evo-dim" />
                  <span>{lead.guestCount} guests</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-evo-accent text-sm font-semibold">{lead.budgetRange}</span>
                  {lead.expiresIn && lead.status === 'new' && (
                    <span className="text-amber-500 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Expires in {lead.expiresIn}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {lead.tasteProfile.map(tag => (
                    <span key={tag} className="text-[10px] text-evo-purple font-bold border-[1.5px] border-evo-dim bg-evo-elevated rounded-full px-2.5 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.button>
          )
        })}

        {filtered.length === 0 && leads.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-evo-text text-sm font-semibold mb-1">עדיין אין לידים</p>
            <p className="text-evo-muted text-xs leading-relaxed">EVO ישלח לך לידים מותאמים<br />לפרופיל שלך בקרוב</p>
          </div>
        )}
        {filtered.length === 0 && leads.length > 0 && (
          <div className="text-center py-16">
            <p className="text-evo-muted text-sm">אין לידים בקטגוריה זו</p>
          </div>
        )}
      </div>
    </div>
  )
}
