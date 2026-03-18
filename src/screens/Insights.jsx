import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Star, Award } from 'lucide-react'
import { insights } from '../data/index'

function formatPrice(n) {
  return n >= 1000 ? `₪${(n / 1000).toFixed(0)}k` : `₪${n}`
}

function ChangeIndicator({ current, previous }) {
  const delta = current - previous
  const pct = previous > 0 ? Math.round((delta / previous) * 100) : 0
  const up = delta >= 0
  return (
    <div className={`flex items-center gap-1 ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span className="text-xs">{up ? '+' : ''}{pct}%</span>
    </div>
  )
}

function RevenueBar({ month, value, maxValue }) {
  const pct = Math.round((value / maxValue) * 100)
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <p className="text-evo-dim text-[10px]">{formatPrice(value)}</p>
      <div className="w-full bg-evo-elevated rounded-full overflow-hidden" style={{ height: 80 }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="w-full bg-evo-accent/60 rounded-full mt-auto"
          style={{ marginTop: `${100 - pct}%` }}
        />
      </div>
      <p className="text-evo-dim text-[10px]">{month}</p>
    </div>
  )
}

export default function Insights() {
  const { thisMonth, lastMonth, allTime, monthlyRevenue, topPackage, acceptanceRate, avgDealSize, repeatClients } = insights
  const maxRevenue = Math.max(...monthlyRevenue.map(r => r.value))

  return (
    <div className="w-full min-h-screen bg-evo-black pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
        <h1 className="text-2xl font-light text-white">Insights</h1>
        <p className="text-evo-muted text-sm mt-1 font-light">Your performance at a glance</p>
      </div>

      {/* This month snapshot */}
      <div className="px-6 mb-6">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-muted mb-3">This Month</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Revenue */}
          <div className="col-span-2 bg-evo-card rounded-2xl border border-evo-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-evo-dim text-xs mb-1">Revenue</p>
                <p className="text-white text-3xl font-light">₪{thisMonth.revenue.toLocaleString()}</p>
              </div>
              <ChangeIndicator current={thisMonth.revenue} previous={lastMonth.revenue} />
            </div>
          </div>

          <div className="bg-evo-card rounded-2xl border border-evo-border p-4">
            <p className="text-evo-dim text-xs mb-1">Leads</p>
            <p className="text-white text-xl font-light">{thisMonth.leads}</p>
            <ChangeIndicator current={thisMonth.leads} previous={lastMonth.leads} />
          </div>

          <div className="bg-evo-card rounded-2xl border border-evo-border p-4">
            <p className="text-evo-dim text-xs mb-1">Booked</p>
            <p className="text-evo-accent text-xl font-light">{thisMonth.booked}</p>
            <ChangeIndicator current={thisMonth.booked} previous={lastMonth.booked} />
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="px-6 mb-6">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-muted mb-3">Revenue (6 months)</p>
        <div className="bg-evo-card rounded-2xl border border-evo-border p-5">
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {monthlyRevenue.map((r, i) => (
              <RevenueBar key={i} month={r.month} value={r.value} maxValue={maxRevenue} />
            ))}
          </div>
        </div>
      </div>

      {/* Performance metrics */}
      <div className="px-6 mb-6">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-muted mb-3">Performance</p>
        <div className="bg-evo-card rounded-2xl border border-evo-border divide-y divide-evo-border">
          <div className="flex items-center justify-between p-4">
            <p className="text-evo-muted text-sm font-light">Acceptance Rate</p>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 bg-evo-elevated rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${acceptanceRate}%` }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="h-full bg-evo-accent rounded-full"
                />
              </div>
              <p className="text-white text-sm font-medium w-10 text-right">{acceptanceRate}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <p className="text-evo-muted text-sm font-light">Average Deal Size</p>
            <p className="text-white text-sm font-medium">₪{avgDealSize.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4">
            <p className="text-evo-muted text-sm font-light">Top Package</p>
            <div className="bg-evo-accent/10 border border-evo-accent/20 rounded-full px-3 py-1">
              <p className="text-evo-accent text-xs font-medium">{topPackage}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <p className="text-evo-muted text-sm font-light">Repeat Clients</p>
            <p className="text-white text-sm font-medium">{repeatClients}</p>
          </div>
        </div>
      </div>

      {/* All-time stats */}
      <div className="px-6 mb-6">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-muted mb-3">All Time</p>
        <div className="bg-evo-card rounded-2xl border border-evo-border p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-white text-xl font-light">{allTime.leads}</p>
              <p className="text-evo-dim text-xs mt-0.5">Leads</p>
            </div>
            <div className="text-center border-x border-evo-border">
              <p className="text-white text-xl font-light">{allTime.booked}</p>
              <p className="text-evo-dim text-xs mt-0.5">Booked</p>
            </div>
            <div className="text-center">
              <p className="text-evo-accent text-xl font-light flex items-center justify-center gap-1">
                <Star size={14} className="fill-evo-accent" />
                {allTime.rating}
              </p>
              <p className="text-evo-dim text-xs mt-0.5">Rating</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-evo-border text-center">
            <p className="text-evo-dim text-xs mb-1">Total Earned</p>
            <p className="text-white text-2xl font-light">₪{allTime.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* EVO ranking */}
      <div className="px-6">
        <div className="bg-evo-card rounded-2xl border-l-2 border-evo-accent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-evo-accent" />
            <p className="text-xs tracking-[0.2em] uppercase text-evo-accent">EVO Ranking</p>
          </div>
          <p className="text-evo-muted text-xs leading-relaxed font-light">
            You're in the <span className="text-white">top 8%</span> of suppliers in your category. High-match leads are prioritised to top performers.
          </p>
        </div>
      </div>
    </div>
  )
}
