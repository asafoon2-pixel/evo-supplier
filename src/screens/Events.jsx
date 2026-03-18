import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const STATUS = {
  confirmed:   { label: 'Confirmed',   color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  'in-progress': { label: 'In Progress', color: 'text-evo-accent bg-evo-accent/10 border-evo-accent/30' },
  completed:   { label: 'Completed',   color: 'text-evo-muted bg-evo-card border-evo-border' },
}

export default function Events() {
  const { events, setActiveEvent, navigate } = useSupplier()
  const [tab, setTab] = useState('active')

  const filtered = tab === 'active'
    ? events.filter(e => e.status !== 'completed')
    : events.filter(e => e.status === 'completed')

  return (
    <div className="w-full min-h-screen bg-evo-black pb-24 overflow-y-auto">
      <div className="px-6 pt-12 pb-5">
        <h1 className="text-2xl font-light text-white">Events</h1>
        <p className="text-evo-muted text-sm mt-1 font-light">Your active and completed bookings</p>
      </div>

      <div className="px-6 flex gap-2 mb-5">
        {[['active', 'Active'], ['completed', 'Completed']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${tab === id ? 'bg-white text-black' : 'border border-evo-border text-evo-muted hover:text-white'}`}>
            {lbl}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-3">
        {filtered.map((evt, i) => {
          const s = STATUS[evt.status] || STATUS.completed
          return (
            <motion.button key={evt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => { setActiveEvent(evt); navigate('eventDetail') }}
              className="w-full bg-evo-card rounded-2xl border border-evo-border overflow-hidden text-left hover:border-evo-border/70 transition-all active:scale-[0.99]">

              <div className="relative h-32 overflow-hidden">
                <img src={evt.heroImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-evo-black via-black/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>
                </div>
                {evt.status !== 'completed' && (
                  <div className="absolute bottom-3 left-4">
                    <span className="text-evo-accent text-2xl font-light">{evt.daysAway}</span>
                    <span className="text-evo-muted text-xs ml-1.5">days away</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-tight truncate">{evt.name}</p>
                  <p className="text-evo-muted text-xs mt-1">{evt.eventType} · {evt.date}</p>
                  <p className="text-evo-muted text-xs mt-0.5">{evt.location}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="text-evo-accent text-sm font-medium">₪{evt.totalValue.toLocaleString()}</span>
                    <span className="text-evo-dim text-xs">{evt.packageName} package</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-evo-dim shrink-0 mt-1" />
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
