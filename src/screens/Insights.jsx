import { motion } from 'framer-motion'
import { Award, TrendingUp, Users, Star, CheckCircle, XCircle, Eye, Clock, BarChart2, DollarSign } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import EvoLogo from '../components/EvoLogo'

const f = (i) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
})

// ── Mini horizontal bar ────────────────────────────────────────
function Bar({ pct, color }) {
  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

// ── KPI card ───────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div {...f(delay)}
      className="flex-1 min-w-[calc(50%-6px)] rounded-[18px] p-4"
      style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0', boxShadow: '0 4px 16px rgba(44,32,22,0.07)' }}>
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-3"
        style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p className="text-[22px] font-black text-evo-text leading-none mb-1">{value}</p>
      <p className="text-[11px] font-bold text-evo-text mb-0.5">{label}</p>
      {sub && <p className="text-[10px] text-evo-muted">{sub}</p>}
    </motion.div>
  )
}

export default function Insights() {
  const { vendorData, leads, events, packages } = useSupplier()

  // ── Derived stats ──────────────────────────────────────────
  const totalLeads    = leads.length
  const bookedLeads   = leads.filter(l => l.status === 'booked').length
  const viewedLeads   = leads.filter(l => l.status === 'viewed').length
  const newLeads      = leads.filter(l => l.status === 'new').length
  const declinedLeads = leads.filter(l => l.status === 'declined').length
  const convRate      = totalLeads > 0 ? Math.round((bookedLeads / totalLeads) * 100) : 0

  const totalRevenue  = vendorData?.total_revenue || events.reduce((s, e) => s + (e.totalValue || 0), 0)
  const totalEvents   = vendorData?.total_events  || events.length
  const avgRating     = vendorData?.avg_rating     || 0
  const totalReviews  = vendorData?.total_reviews  || 0
  const responseRate  = vendorData?.response_rate  != null ? vendorData.response_rate : (totalLeads > 0 ? Math.round(((totalLeads - newLeads) / totalLeads) * 100) : 0)
  const repeatRate    = vendorData?.repeat_client_rate != null ? Math.round(vendorData.repeat_client_rate * 100) : null

  // Revenue from recent events (last 6)
  const recentEvents  = [...events]
    .filter(e => e.totalValue > 0)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 6)

  const maxEventVal   = recentEvents.length > 0 ? Math.max(...recentEvents.map(e => e.totalValue || 0)) : 1

  // Lead funnel items
  const funnelItems = [
    { label: 'לידים חדשים',  count: newLeads,      color: '#6B5FE4', pct: totalLeads > 0 ? (newLeads / totalLeads) * 100 : 0 },
    { label: 'נצפו',          count: viewedLeads,   color: '#E8A030', pct: totalLeads > 0 ? (viewedLeads / totalLeads) * 100 : 0 },
    { label: 'הוזמנו',        count: bookedLeads,   color: '#4A9E72', pct: totalLeads > 0 ? (bookedLeads / totalLeads) * 100 : 0 },
    { label: 'נדחו',          count: declinedLeads, color: '#D4607A', pct: totalLeads > 0 ? (declinedLeads / totalLeads) * 100 : 0 },
  ]

  const hasAnyData = totalLeads > 0 || totalEvents > 0 || totalRevenue > 0

  return (
    <div className="w-full bg-evo-bg pb-28">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-6 pt-14 pb-5 bg-white border-b border-evo-border">
        <div className="mb-2"><EvoLogo height={20} variant="light" /></div>
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>תובנות</h1>
        <p className="text-evo-muted text-sm mt-1">הביצועים שלך במבט על</p>
      </div>

      {!hasAnyData ? (
        /* ── Empty state ──────────────────────────────────────── */
        <div className="px-6 mt-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5"
            style={{ background: 'rgba(107,95,228,0.1)' }}>
            <BarChart2 size={28} style={{ color: '#6B5FE4' }} />
          </div>
          <p className="text-evo-text text-base font-semibold mb-2">עדיין אין נתונים</p>
          <p className="text-evo-muted text-sm leading-relaxed max-w-xs">
            נתוני הביצועים יופיעו כאן לאחר שתתחיל לקבל לידים ואירועים
          </p>
        </div>
      ) : (
        <div className="px-5 pt-5 space-y-4">

          {/* ── KPI cards ────────────────────────────────────────── */}
          <motion.div {...f(0)}>
            <p className="text-[10px] font-black uppercase tracking-wider text-evo-muted mb-3">סיכום כולל</p>
            <div className="flex flex-wrap gap-3">
              <KpiCard
                icon={DollarSign} label="הכנסות" delay={1}
                value={totalRevenue > 0 ? `₪${totalRevenue.toLocaleString()}` : '—'}
                sub="סך הכנסות"
                color="#4A9E72"
              />
              <KpiCard
                icon={CheckCircle} label="אירועים" delay={2}
                value={totalEvents}
                sub="אירועים שבוצעו"
                color="#6B5FE4"
              />
              <KpiCard
                icon={TrendingUp} label="המרה" delay={3}
                value={`${convRate}%`}
                sub={`${bookedLeads} מתוך ${totalLeads} לידים`}
                color="#E8A030"
              />
              <KpiCard
                icon={Star} label="דירוג" delay={4}
                value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
                sub={totalReviews > 0 ? `${totalReviews} ביקורות` : 'אין ביקורות עדיין'}
                color="#D4607A"
              />
            </div>
          </motion.div>

          {/* ── Response & repeat rates ──────────────────────────── */}
          <motion.div {...f(5)}
            className="rounded-[20px] p-4"
            style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0', boxShadow: '0 4px 16px rgba(44,32,22,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-wider text-evo-muted mb-4">מדדי שירות</p>
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-evo-text">שיעור מענה</span>
                  <span className="text-xs font-black text-evo-accent">{responseRate}%</span>
                </div>
                <Bar pct={responseRate} color="#6B5FE4" />
              </div>
              {repeatRate !== null && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-evo-text">לקוחות חוזרים</span>
                    <span className="text-xs font-black" style={{ color: '#4A9E72' }}>{repeatRate}%</span>
                  </div>
                  <Bar pct={repeatRate} color="#4A9E72" />
                </div>
              )}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-evo-text">שיעור המרה</span>
                  <span className="text-xs font-black" style={{ color: '#E8A030' }}>{convRate}%</span>
                </div>
                <Bar pct={convRate} color="#E8A030" />
              </div>
            </div>
          </motion.div>

          {/* ── Lead funnel ──────────────────────────────────────── */}
          {totalLeads > 0 && (
            <motion.div {...f(6)}
              className="rounded-[20px] p-4"
              style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0', boxShadow: '0 4px 16px rgba(44,32,22,0.07)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider text-evo-muted mb-4">
                משפך לידים — {totalLeads} סה"כ
              </p>
              <div className="space-y-3">
                {funnelItems.map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-evo-muted w-20 text-right shrink-0">{item.label}</span>
                    <Bar pct={item.pct} color={item.color} />
                    <span className="text-[11px] font-black w-5 text-left shrink-0"
                      style={{ color: item.color }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Revenue per event ────────────────────────────────── */}
          {recentEvents.length > 0 && (
            <motion.div {...f(7)}
              className="rounded-[20px] p-4"
              style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0', boxShadow: '0 4px 16px rgba(44,32,22,0.07)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider text-evo-muted mb-4">הכנסה לפי אירוע</p>
              <div className="space-y-3">
                {recentEvents.map((evt, i) => {
                  const pct = maxEventVal > 0 ? ((evt.totalValue || 0) / maxEventVal) * 100 : 0
                  return (
                    <div key={evt.id || i} className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-evo-muted w-24 text-right truncate shrink-0">
                        {evt.name || `אירוע ${i + 1}`}
                      </span>
                      <Bar pct={pct} color="#6B5FE4" />
                      <span className="text-[11px] font-black shrink-0" style={{ color: '#6B5FE4' }}>
                        ₪{(evt.totalValue || 0).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Package stats ────────────────────────────────────── */}
          {packages.length > 0 && (
            <motion.div {...f(8)}
              className="rounded-[20px] p-4"
              style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0', boxShadow: '0 4px 16px rgba(44,32,22,0.07)' }}>
              <p className="text-[10px] font-black uppercase tracking-wider text-evo-muted mb-3">חבילות הקטלוג</p>
              <div className="flex gap-3">
                <div className="flex-1 text-center p-3 rounded-[14px]" style={{ background: 'rgba(107,95,228,0.08)' }}>
                  <p className="text-2xl font-black text-evo-accent">{packages.length}</p>
                  <p className="text-[10px] text-evo-muted mt-0.5">חבילות פעילות</p>
                </div>
                <div className="flex-1 text-center p-3 rounded-[14px]" style={{ background: 'rgba(74,158,114,0.08)' }}>
                  <p className="text-2xl font-black" style={{ color: '#4A9E72' }}>
                    {packages.filter(p => p.is_available !== false).length}
                  </p>
                  <p className="text-[10px] text-evo-muted mt-0.5">זמינות כעת</p>
                </div>
                <div className="flex-1 text-center p-3 rounded-[14px]" style={{ background: 'rgba(232,160,48,0.08)' }}>
                  <p className="text-2xl font-black" style={{ color: '#E8A030' }}>
                    {packages.filter(p => p.is_popular).length}
                  </p>
                  <p className="text-[10px] text-evo-muted mt-0.5">פופולריות</p>
                </div>
              </div>
              {/* Price range */}
              {(vendorData?._minPrice || vendorData?._maxPrice) && (
                <div className="mt-3 pt-3 border-t border-evo-border flex justify-between items-center">
                  <span className="text-xs text-evo-muted">טווח מחירים</span>
                  <span className="text-xs font-black text-evo-text">
                    ₪{(vendorData._minPrice || 0).toLocaleString()} – ₪{(vendorData._maxPrice || 0).toLocaleString()}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* ── EVO ranking card ─────────────────────────────────── */}
          <motion.div {...f(9)}
            className="rounded-[20px] p-4"
            style={{
              background: 'linear-gradient(135deg, #3D2B7A 0%, #6B5FE4 100%)',
              boxShadow: '0 8px 24px rgba(61,43,122,0.35)',
            }}>
            <div className="flex items-center gap-2 mb-3">
              <Award size={14} color="rgba(255,255,255,0.7)" />
              <p className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                דירוג EVO
              </p>
            </div>
            {/* Profile completeness */}
            {(() => {
              const fields = [
                vendorData?.business_name,
                vendorData?.category,
                vendorData?.profile_photo_url,
                vendorData?.description,
                vendorData?.city,
                packages.length > 0,
              ]
              const done = fields.filter(Boolean).length
              const pct  = Math.round((done / fields.length) * 100)
              return (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white text-sm font-bold">השלמת פרופיל</p>
                    <p className="text-white font-black text-sm">{pct}%</p>
                  </div>
                  <div className="w-full h-2 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: pct >= 80 ? '#4AE89A' : '#E8B86D' }}
                    />
                  </div>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {pct < 100
                      ? 'פרופיל מלא מביא התאמות איכותיות יותר מ-EVO'
                      : 'הפרופיל שלך מלא — אתה מקבל עדיפות בהתאמות'}
                  </p>
                </>
              )
            })()}
          </motion.div>

        </div>
      )}
    </div>
  )
}
