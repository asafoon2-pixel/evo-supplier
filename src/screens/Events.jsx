import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const STATUS = {
  confirmed:     { label: 'Confirmed',   color: 'text-evo-green bg-evo-green/10 border-evo-green/30' },
  'in-progress': { label: 'In Progress', color: 'text-evo-accent bg-evo-elevated border-evo-dim' },
  completed:     { label: 'Completed',   color: 'text-evo-muted bg-evo-bg border-evo-border' },
}

export default function Events() {
  const { events, setActiveEvent, navigate } = useSupplier()
  const [tab, setTab] = useState('active')

  const filtered = tab === 'active'
    ? events.filter(e => e.status !== 'completed')
    : events.filter(e => e.status === 'completed')

  return (
    <div className="w-full bg-evo-bg pb-8 overflow-y-auto">
      <div className="px-6 pt-12 pb-5 bg-white border-b border-evo-border">
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>Events</h1>
        <p className="text-evo-muted text-sm mt-1">Your active and completed bookings</p>
      </div>

      <div className="px-6 py-4 flex gap-2 bg-white border-b border-evo-border">
        {[['active', 'Active'], ['completed', 'Completed']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              tab === id
                ? 'bg-evo-purple-mid text-white'
                : 'border-[1.5px] border-evo-border text-evo-muted hover:border-evo-dim hover:text-evo-text'
            }`}>
            {lbl}
          </button>
        ))}
      </div>

      <div className="px-6 pt-4 space-y-3">
        {filtered.map((evt, i) => {
          const s = STATUS[evt.status] || STATUS.completed
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
                  <p className="text-evo-text text-sm font-semibold leading-tight truncate">{evt.name}</p>
                  <p className="text-evo-muted text-xs mt-1">{evt.eventType} · {evt.date}</p>
                  <p className="text-evo-muted text-xs mt-0.5">{evt.location}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="text-evo-accent text-sm font-semibold">₪{evt.totalValue.toLocaleString()}</span>
                    <span className="text-evo-muted text-xs">{evt.packageName} package</span>
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
