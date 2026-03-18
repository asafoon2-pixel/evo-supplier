import { motion } from 'framer-motion'
import { TrendingUp, Clock, Check, ChevronRight } from 'lucide-react'
import { payments } from '../data/index'

function formatPrice(n) {
  return `₪${n.toLocaleString()}`
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-evo-card rounded-2xl border border-evo-border p-4">
      <p className="text-evo-dim text-xs tracking-widest uppercase mb-2">{label}</p>
      <p className={`text-2xl font-light ${accent ? 'text-evo-accent' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-evo-dim text-xs mt-1">{sub}</p>}
    </div>
  )
}

function UpcomingCard({ payment }) {
  const urgent = payment.daysUntil <= 14
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-evo-card rounded-2xl border p-4 ${urgent ? 'border-evo-accent/30' : 'border-evo-border'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-white text-sm font-light truncate">{payment.eventName}</p>
          <p className="text-evo-muted text-xs mt-0.5">{payment.type}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-lg font-light ${urgent ? 'text-evo-accent' : 'text-white'}`}>
            {formatPrice(payment.amount)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-evo-border">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className={urgent ? 'text-evo-accent' : 'text-evo-dim'} />
          <p className={`text-xs ${urgent ? 'text-evo-accent' : 'text-evo-muted'}`}>
            Due {payment.dueDate}
          </p>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full ${
          urgent ? 'bg-evo-accent/10 text-evo-accent' : 'bg-evo-elevated text-evo-muted'
        }`}>
          {payment.daysUntil} days
        </div>
      </div>
      <p className="text-evo-dim text-xs mt-2">
        EVO will release this payment to you upon event completion.
      </p>
    </motion.div>
  )
}

function ReceivedRow({ payment }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-evo-border last:border-0">
      <div className="w-8 h-8 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center shrink-0">
        <Check size={12} className="text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-light truncate">{payment.eventName}</p>
        <p className="text-evo-dim text-xs mt-0.5">{payment.type} · {payment.date}</p>
      </div>
      <p className="text-white text-sm font-medium shrink-0">{formatPrice(payment.amount)}</p>
    </div>
  )
}

export default function Payments() {
  const s = payments.summary

  return (
    <div className="w-full min-h-screen bg-evo-black pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
        <h1 className="text-2xl font-light text-white">Payments</h1>
        <p className="text-evo-muted text-sm mt-1 font-light">All transactions managed through EVO</p>
      </div>

      {/* Summary stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="This Month" value={formatPrice(s.thisMonth)} sub={`vs ${formatPrice(s.lastMonth)} last month`} />
          <StatCard label="Outstanding" value={formatPrice(s.outstanding)} sub="2 upcoming payments" accent />
          <div className="col-span-2">
            <StatCard label="All-Time Earned" value={formatPrice(s.allTime)} sub="134 events completed" />
          </div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="px-6 mb-6">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-muted mb-4">Upcoming</p>
        <div className="space-y-3">
          {payments.upcoming.map(p => (
            <UpcomingCard key={p.id} payment={p} />
          ))}
        </div>
      </div>

      {/* Received */}
      <div className="px-6">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-muted mb-4">Received</p>
        <div className="bg-evo-card rounded-2xl border border-evo-border px-4">
          {payments.received.map(p => (
            <ReceivedRow key={p.id} payment={p} />
          ))}
        </div>
      </div>

      {/* EVO payment model note */}
      <div className="px-6 mt-6">
        <div className="bg-evo-card rounded-2xl border-l-2 border-evo-accent p-4">
          <p className="text-xs tracking-[0.2em] uppercase text-evo-accent mb-2">How EVO Payments Work</p>
          <p className="text-evo-muted text-xs leading-relaxed font-light">
            EVO collects deposits and final payments from clients, holds them securely, and releases to you upon event completion. No chasing invoices.
          </p>
        </div>
      </div>
    </div>
  )
}
