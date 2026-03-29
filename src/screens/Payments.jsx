import { motion } from 'framer-motion'
import { Clock, Check } from 'lucide-react'
import { payments } from '../data/index'

function formatPrice(n) {
  return `₪${n.toLocaleString()}`
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4"
      style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-evo-accent' : 'text-evo-text'}`}>{value}</p>
      {sub && <p className="text-evo-muted text-xs mt-1">{sub}</p>}
    </div>
  )
}

function UpcomingCard({ payment }) {
  const urgent = payment.daysUntil <= 14
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-[20px] border-[1.5px] p-4 ${urgent ? 'border-evo-dim' : 'border-evo-border'}`}
      style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-evo-text text-sm font-semibold truncate">{payment.eventName}</p>
          <p className="text-evo-muted text-xs mt-0.5">{payment.type}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-lg font-bold ${urgent ? 'text-evo-accent' : 'text-evo-text'}`}>
            {formatPrice(payment.amount)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-evo-border">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className={urgent ? 'text-evo-accent' : 'text-evo-muted'} />
          <p className={`text-xs ${urgent ? 'text-evo-accent font-medium' : 'text-evo-muted'}`}>
            Due {payment.dueDate}
          </p>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          urgent ? 'bg-evo-elevated text-evo-accent border border-evo-dim' : 'bg-evo-bg text-evo-muted border border-evo-border'
        }`}>
          {payment.daysUntil} days
        </div>
      </div>
      <p className="text-evo-muted text-xs mt-2">
        EVO will release this payment to you upon event completion.
      </p>
    </motion.div>
  )
}

function ReceivedRow({ payment }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-evo-border last:border-0">
      <div className="w-8 h-8 rounded-full bg-evo-green/10 border border-evo-green/20 flex items-center justify-center shrink-0">
        <Check size={12} className="text-evo-green" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-evo-text text-sm font-medium truncate">{payment.eventName}</p>
        <p className="text-evo-muted text-xs mt-0.5">{payment.type} · {payment.date}</p>
      </div>
      <p className="text-evo-text text-sm font-semibold shrink-0">{formatPrice(payment.amount)}</p>
    </div>
  )
}

export default function Payments() {
  const s = payments.summary

  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white border-b border-evo-border">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>Payments</h1>
        <p className="text-evo-muted text-sm mt-1">All transactions managed through EVO</p>
      </div>

      {/* Summary stats */}
      <div className="px-6 mt-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="This Month" value={formatPrice(s.thisMonth)} sub={`vs ${formatPrice(s.lastMonth)} last month`} />
          <StatCard label="Outstanding" value={formatPrice(s.outstanding)} sub="2 upcoming payments" accent />
          <div className="col-span-2">
            <StatCard label="All-Time Earned" value={formatPrice(s.allTime)} sub="134 events completed" />
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="px-6 mb-5">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-4">Upcoming</p>
        <div className="space-y-3">
          {payments.upcoming.map(p => (
            <UpcomingCard key={p.id} payment={p} />
          ))}
        </div>
      </div>

      {/* Received */}
      <div className="px-6">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-4">Received</p>
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border px-4"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          {payments.received.map(p => (
            <ReceivedRow key={p.id} payment={p} />
          ))}
        </div>
      </div>

      {/* EVO payment model note */}
      <div className="px-6 mt-5">
        <div className="bg-white rounded-[20px] border-l-[3px] border-evo-accent border-[1.5px] border-evo-border p-4"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent mb-2">How EVO Payments Work</p>
          <p className="text-evo-muted text-xs leading-relaxed">
            EVO collects deposits and final payments from clients, holds them securely, and releases to you upon event completion. No chasing invoices.
          </p>
        </div>
      </div>
    </div>
  )
}
