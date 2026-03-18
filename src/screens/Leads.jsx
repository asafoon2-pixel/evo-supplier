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
  new:      { dot: 'bg-evo-accent', badge: 'text-evo-accent bg-evo-accent/10 border-evo-accent/30', label: 'New' },
  viewed:   { dot: 'bg-evo-muted',  badge: 'text-evo-muted bg-evo-card border-evo-border',          label: 'Viewed' },
  booked:   { dot: 'bg-green-400',  badge: 'text-green-400 bg-green-500/10 border-green-500/30',    label: 'Booked' },
  declined: { dot: 'bg-evo-dim',    badge: 'text-evo-dim bg-evo-card border-evo-border',            label: 'Declined' },
}

export default function Leads() {
  const { leads, setActiveLead, navigate } = useSupplier()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  return (
    <div className="w-full min-h-screen bg-evo-black pb-24 overflow-y-auto">
      <div className="px-6 pt-12 pb-5">
        <h1 className="text-2xl font-light text-white">Leads</h1>
        <p className="text-evo-muted text-sm mt-1 font-light">EVO-matched events for your profile</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-6 mb-5 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${filter === f.id ? 'bg-white text-black' : 'border border-evo-border text-evo-muted hover:border-evo-dim hover:text-white'}`}>
            {f.label}
            {f.id !== 'all' && (
              <span className="ml-1.5 opacity-60">{leads.filter(l => l.status === f.id).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-3">
        {filtered.map((lead, i) => {
          const s = STATUS_STYLE[lead.status] || STATUS_STYLE.viewed
          return (
            <motion.button key={lead.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { setActiveLead(lead); navigate('leadDetail') }}
              className="w-full rounded-2xl border border-evo-border bg-evo-card overflow-hidden text-left hover:border-evo-border/70 transition-all active:scale-[0.99]">

              {/* Hero image strip */}
              <div className="relative h-36 overflow-hidden">
                <img src={lead.heroImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-evo-black via-black/30 to-transparent" />

                {/* Match score */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
                  <Zap size={11} className="text-evo-accent" />
                  <span className="text-white text-xs font-semibold">{lead.matchScore}% match</span>
                </div>

                {/* Status */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${s.badge}`}>{s.label}</span>
                </div>

                {/* Event name bottom */}
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white text-sm font-medium leading-tight">{lead.eventName}</p>
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
                  <span className="text-evo-accent text-sm font-medium">{lead.budgetRange}</span>
                  {lead.expiresIn && lead.status === 'new' && (
                    <span className="text-amber-400 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Expires in {lead.expiresIn}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {lead.tasteProfile.map(tag => (
                    <span key={tag} className="text-[10px] text-evo-muted border border-evo-border rounded-full px-2.5 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.button>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-evo-muted text-sm">No leads in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
