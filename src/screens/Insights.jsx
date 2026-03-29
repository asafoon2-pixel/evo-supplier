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
    <div className={`flex items-center gap-1 ${up ? 'text-evo-green' : 'text-evo-red'}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span className="text-xs font-semibold">{up ? '+' : ''}{pct}%</span>
    </div>
  )
}

function RevenueBar({ month, value, maxValue }) {
  const pct = Math.round((value / maxValue) * 100)
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <p className="text-evo-muted text-[10px]">{formatPrice(value)}</p>
      <div className="w-full bg-evo-elevated rounded-full overflow-hidden" style={{ height: 80 }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="w-full bg-evo-accent rounded-full mt-auto"
          style={{ marginTop: `${100 - pct}%` }}
        />
      </div>
      <p className="text-evo-muted text-[10px]">{month}</p>
    </div>
  )
}

export default function Insights() {
  const { thisMonth, lastMonth, allTime, monthlyRevenue, topPackage, acceptanceRate, avgDealSize, repeatClients } = insights
  const maxRevenue = Math.max(...monthlyRevenue.map(r => r.value))

  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white border-b border-evo-border">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>Insights</h1>
        <p className="text-evo-muted text-sm mt-1">Your performance at a glance</p>
      </div>

      {/* This month snapshot */}
      <div className="px-6 mt-5 mb-5">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-3">This Month</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Revenue */}
          <div className="col-span-2 bg-white rounded-[20px] border-[1.5px] border-evo-border p-4"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-evo-muted text-xs mb-1">Revenue</p>
                <p className="text-evo-text text-3xl font-bold">₪{thisMonth.revenue.toLocaleString()}</p>
              </div>
              <ChangeIndicator current={thisMonth.revenue} previous={lastMonth.revenue} />
            </div>
          </div>

          <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
            <p className="text-evo-muted text-xs mb-1">Leads</p>
            <p className="text-evo-text text-xl font-bold">{thisMonth.leads}</p>
            <ChangeIndicator current={thisMonth.leads} previous={lastMonth.leads} />
          </div>

          <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
            <p className="text-evo-muted text-xs mb-1">Booked</p>
            <p className="text-evo-accent text-xl font-bold">{thisMonth.booked}</p>
            <ChangeIndicator current={thisMonth.booked} previous={lastMonth.booked} />
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="px-6 mb-5">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-3">Revenue (6 months)</p>
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {monthlyRevenue.map((r, i) => (
              <RevenueBar key={i} month={r.month} value={r.value} maxValue={maxRevenue} />
            ))}
          </div>
        </div>
      </div>

      {/* Performance metrics */}
      <div className="px-6 mb-5">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-3">Performance</p>
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border divide-y divide-evo-border"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="flex items-center justify-between p-4">
            <p className="text-evo-muted text-sm">Acceptance Rate</p>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 bg-evo-elevated rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${acceptanceRate}%` }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="h-full bg-evo-accent rounded-full"
                />
              </div>
              <p className="text-evo-text text-sm font-semibold w-10 text-right">{acceptanceRate}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <p className="text-evo-muted text-sm">Average Deal Size</p>
            <p className="text-evo-text text-sm font-semibold">₪{avgDealSize.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4">
            <p className="text-evo-muted text-sm">Top Package</p>
            <div className="bg-evo-elevated border-[1.5px] border-evo-dim rounded-full px-3 py-1">
              <p className="text-evo-purple text-xs font-bold">{topPackage}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <p className="text-evo-muted text-sm">Repeat Clients</p>
            <p className="text-evo-text text-sm font-semibold">{repeatClients}</p>
          </div>
        </div>
      </div>

      {/* All-time stats */}
      <div className="px-6 mb-5">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-3">All Time</p>
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-evo-text text-xl font-bold">{allTime.leads}</p>
              <p className="text-evo-muted text-xs mt-0.5">Leads</p>
            </div>
            <div className="text-center border-x border-evo-border">
              <p className="text-evo-text text-xl font-bold">{allTime.booked}</p>
              <p className="text-evo-muted text-xs mt-0.5">Booked</p>
            </div>
            <div className="text-center">
              <p className="text-evo-accent text-xl font-bold flex items-center justify-center gap-1">
                <Star size={14} className="fill-evo-accent" />
                {allTime.rating}
              </p>
              <p className="text-evo-muted text-xs mt-0.5">Rating</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-evo-border text-center">
            <p className="text-evo-muted text-xs mb-1">Total Earned</p>
            <p className="text-evo-text text-2xl font-bold">₪{allTime.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* EVO ranking */}
      <div className="px-6">
        <div className="bg-white rounded-[20px] border-l-[3px] border-evo-accent border-[1.5px] border-evo-border p-4"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-evo-accent" />
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent">EVO Ranking</p>
          </div>
          <p className="text-evo-muted text-xs leading-relaxed">
            You're in the <span className="text-evo-text font-semibold">top 8%</span> of suppliers in your category. High-match leads are prioritised to top performers.
          </p>
        </div>
      </div>
    </div>
  )
}
