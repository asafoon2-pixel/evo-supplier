import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, ShoppingBag, TrendingUp, BarChart2,
  CheckCircle, XCircle, Clock, RefreshCw, LogOut,
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react'
import { collection, getDocs, getDoc, doc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useSupplier } from '../context/SupplierContext'

const f = (i = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06, ease: 'easeOut' },
})

const STATUS_COLOR = {
  new:      { bg: '#FFF3CD', text: '#856404', label: 'חדש' },
  viewed:   { bg: '#D1ECF1', text: '#0C5460', label: 'נצפה' },
  booked:   { bg: '#D4EDDA', text: '#155724', label: 'נסגר' },
  declined: { bg: '#F8D7DA', text: '#721C24', label: 'נדחה' },
}

function Badge({ status }) {
  const c = STATUS_COLOR[status] || { bg: '#E9ECEF', text: '#495057', label: status }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      {c.label}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div {...f(delay)}
      className="flex-1 min-w-[calc(50%-6px)] rounded-[16px] p-4"
      style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0', boxShadow: '0 4px 12px rgba(44,32,22,0.07)' }}>
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-3"
        style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p className="text-[22px] font-black text-evo-text leading-none mb-1">{value}</p>
      <p className="text-[11px] font-bold text-evo-muted">{label}</p>
    </motion.div>
  )
}

function SectionTitle({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-evo-muted mb-3 px-1">
      {children}
    </p>
  )
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────
function OverviewTab({ vendors, clients, leads, events }) {
  const booked   = leads.filter(l => l.status === 'booked')
  const active   = leads.filter(l => l.status === 'new')
  const declined = leads.filter(l => l.status === 'declined')
  const revenue  = booked.reduce((s, l) => s + (l.order_total || 0), 0)

  const recentBookings = [...booked]
    .sort((a, b) => (b.updated_at?.toMillis?.() || 0) - (a.updated_at?.toMillis?.() || 0))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>סטטיסטיקות כלליות</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <StatCard icon={Users}       label="ספקים רשומים"  value={vendors.length}  color="#6B5FE4" delay={0} />
          <StatCard icon={ShoppingBag} label="לקוחות"        value={clients.length}  color="#E4845F" delay={1} />
          <StatCard icon={CheckCircle} label="הזמנות שנסגרו" value={booked.length}   color="#27AE60" delay={2} />
          <StatCard icon={Clock}       label="לידים פעילים"  value={active.length}   color="#F39C12" delay={3} />
          <StatCard icon={XCircle}     label="נדחו"          value={declined.length} color="#E74C3C" delay={4} />
          <StatCard icon={TrendingUp}  label="הכנסות כוללות" value={`₪${revenue.toLocaleString()}`} color="#2ECC71" delay={5} />
        </div>
      </div>

      <div>
        <SectionTitle>הזמנות אחרונות שנסגרו</SectionTitle>
        {recentBookings.length === 0 ? (
          <p className="text-sm text-evo-muted text-center py-4">אין הזמנות עדיין</p>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((lead, i) => (
              <motion.div key={lead.id} {...f(i)}
                className="rounded-[14px] p-3"
                style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-evo-text truncate max-w-[55%]">
                    {lead.client_name || 'לקוח'}
                  </p>
                  <span className="text-sm font-black" style={{ color: '#27AE60' }}>
                    ₪{(lead.order_total || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-evo-muted">
                  {lead.vendor_name || lead.vendor_id?.slice(0, 8)} · {lead.category || '—'}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab: Bookings ─────────────────────────────────────────────────────────────
function BookingsTab({ leads, vendors, clients }) {
  const booked = [...leads.filter(l => l.status === 'booked')]
    .sort((a, b) => (b.updated_at?.toMillis?.() || b.created_at?.toMillis?.() || 0)
                  - (a.updated_at?.toMillis?.() || a.created_at?.toMillis?.() || 0))

  const vendorMap  = Object.fromEntries(vendors.map(v => [v.id, v]))
  const clientMap  = Object.fromEntries(clients.map(c => [c.id, c]))
  const totalRev   = booked.reduce((s, l) => s + (l.order_total || 0), 0)

  return (
    <div className="space-y-4">
      <div className="rounded-[16px] p-4 text-center"
        style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)' }}>
        <p className="text-white text-[11px] font-bold uppercase tracking-wider mb-1">
          סה"כ הכנסות מהזמנות
        </p>
        <p className="text-white text-3xl font-black">₪{totalRev.toLocaleString()}</p>
        <p className="text-white/80 text-xs mt-1">{booked.length} הזמנות שנסגרו</p>
      </div>

      {booked.length === 0 ? (
        <p className="text-sm text-evo-muted text-center py-6">אין הזמנות שנסגרו עדיין</p>
      ) : (
        <div className="space-y-2">
          {booked.map((lead, i) => {
            const vendor = vendorMap[lead.vendor_id]
            const client = clientMap[lead.client_id]
            const date = lead.updated_at?.toDate?.()?.toLocaleDateString('he-IL') || '—'
            return (
              <motion.div key={lead.id} {...f(i)}
                className="rounded-[14px] p-3 space-y-2"
                style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-evo-text">
                      {client?.displayName || lead.client_name || 'לקוח'}
                    </p>
                    <p className="text-[10px] text-evo-muted">{client?.email || lead.client_email || '—'}</p>
                  </div>
                  <span className="text-sm font-black" style={{ color: '#27AE60' }}>
                    ₪{(lead.order_total || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-evo-muted">
                  <span className="font-semibold text-evo-text">
                    {vendor?.business_name || vendor?.owner_full_name || lead.vendor_name || lead.vendor_id?.slice(0, 8)}
                  </span>
                  <span>·</span>
                  <span>{lead.category || '—'}</span>
                  <span>·</span>
                  <span>{date}</span>
                </div>
                {lead.eventType && (
                  <p className="text-[10px] text-evo-muted">
                    {lead.eventType}{lead.date ? ` · ${lead.date}` : ''}{lead.guestCount ? ` · ${lead.guestCount} אורחים` : ''}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Tab: All Leads ────────────────────────────────────────────────────────────
function LeadsTab({ leads, vendors, clients }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? leads
    : leads.filter(l => l.status === filter)

  const sorted = [...filtered].sort(
    (a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0)
  )

  const vendorMap = Object.fromEntries(vendors.map(v => [v.id, v]))

  const counts = {
    all:      leads.length,
    new:      leads.filter(l => l.status === 'new').length,
    booked:   leads.filter(l => l.status === 'booked').length,
    declined: leads.filter(l => l.status === 'declined').length,
  }

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'all',      label: `הכל (${counts.all})` },
          { key: 'new',      label: `חדש (${counts.new})` },
          { key: 'booked',   label: `נסגר (${counts.booked})` },
          { key: 'declined', label: `נדחה (${counts.declined})` },
        ].map(({ key, label }) => (
          <button key={key}
            onClick={() => setFilter(key)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: filter === key ? '#3D2B7A' : '#F0EBE3',
              color:      filter === key ? '#fff'    : '#8A7560',
            }}>
            {label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-evo-muted text-center py-6">אין לידים</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((lead, i) => {
            const vendor = vendorMap[lead.vendor_id]
            const date = lead.created_at?.toDate?.()?.toLocaleDateString('he-IL') || '—'
            return (
              <motion.div key={lead.id} {...f(i % 10)}
                className="rounded-[14px] p-3"
                style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-evo-text truncate">
                      {lead.client_name || 'לקוח'}
                    </p>
                    <p className="text-[11px] text-evo-muted truncate">
                      {vendor?.business_name || vendor?.owner_full_name || lead.vendor_name || lead.vendor_id?.slice(0, 8)}
                      {lead.category ? ` · ${lead.category}` : ''}
                    </p>
                    <p className="text-[10px] text-evo-muted mt-0.5">
                      {date}{lead.order_total ? ` · ₪${lead.order_total.toLocaleString()}` : ''}
                    </p>
                  </div>
                  <Badge status={lead.status} />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Tab: Vendors ──────────────────────────────────────────────────────────────
function VendorsTab({ vendors, leads }) {
  const [expanded, setExpanded] = useState(null)

  const vendorStats = vendors.map(v => {
    const vLeads   = leads.filter(l => l.vendor_id === v.id)
    const booked   = vLeads.filter(l => l.status === 'booked')
    const revenue  = booked.reduce((s, l) => s + (l.order_total || 0), 0)
    return { ...v, _leads: vLeads.length, _booked: booked.length, _revenue: revenue }
  }).sort((a, b) => b._revenue - a._revenue)

  return (
    <div className="space-y-2">
      {vendorStats.map((v, i) => (
        <motion.div key={v.id} {...f(i % 10)}
          className="rounded-[14px] overflow-hidden"
          style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0' }}>
          <button
            onClick={() => setExpanded(expanded === v.id ? null : v.id)}
            className="w-full flex items-center justify-between p-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              {v.profile_photo_url ? (
                <img src={v.profile_photo_url} alt=""
                  className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
                  style={{ background: '#6B5FE4' }}>
                  {(v.business_name || v.owner_full_name || '?')[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-evo-text truncate">
                  {v.business_name || v.owner_full_name || 'ספק'}
                </p>
                <p className="text-[11px] text-evo-muted">{v.category || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-black" style={{ color: '#27AE60' }}>
                ₪{v._revenue.toLocaleString()}
              </span>
              {expanded === v.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          {expanded === v.id && (
            <div className="px-3 pb-3 space-y-1 border-t" style={{ borderColor: '#E5DDD0' }}>
              <div className="pt-2 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'לידים', value: v._leads },
                  { label: 'נסגרו', value: v._booked },
                  { label: 'הכנסה', value: `₪${v._revenue.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-[10px] p-2"
                    style={{ background: '#F0EBE3' }}>
                    <p className="text-[13px] font-black text-evo-text">{value}</p>
                    <p className="text-[10px] text-evo-muted">{label}</p>
                  </div>
                ))}
              </div>
              {v.phone && (
                <p className="text-[11px] text-evo-muted pt-1">
                  טלפון: {v.phone}
                </p>
              )}
              {v.city && (
                <p className="text-[11px] text-evo-muted">עיר: {v.city}</p>
              )}
              <p className="text-[10px] text-evo-muted font-mono">{v.id}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ── Tab: Clients ──────────────────────────────────────────────────────────────
function ClientsTab({ clients, leads, events }) {
  const clientStats = clients.map(c => {
    const cLeads  = leads.filter(l => l.client_id === c.id)
    const cEvents = events.filter(e => e.userId === c.id)
    const spent   = cLeads.filter(l => l.status === 'booked').reduce((s, l) => s + (l.order_total || 0), 0)
    return { ...c, _leads: cLeads.length, _events: cEvents.length, _spent: spent }
  }).sort((a, b) => b._spent - a._spent)

  return (
    <div className="space-y-2">
      {clientStats.length === 0 ? (
        <p className="text-sm text-evo-muted text-center py-6">אין לקוחות עדיין</p>
      ) : (
        clientStats.map((c, i) => (
          <motion.div key={c.id} {...f(i % 10)}
            className="rounded-[14px] p-3"
            style={{ background: '#FDFAF5', border: '1.5px solid #E5DDD0' }}>
            <div className="flex items-center gap-3">
              {c.photoURL || c.profile_photo_url ? (
                <img src={c.photoURL || c.profile_photo_url} alt=""
                  className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
                  style={{ background: '#E4845F' }}>
                  {(c.displayName || c.name || '?')[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-evo-text truncate">
                  {c.displayName || c.name || 'לקוח'}
                </p>
                <p className="text-[11px] text-evo-muted truncate">{c.email || '—'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black" style={{ color: c._spent > 0 ? '#27AE60' : '#8A7560' }}>
                  {c._spent > 0 ? `₪${c._spent.toLocaleString()}` : '—'}
                </p>
                <p className="text-[10px] text-evo-muted">
                  {c._leads} לידים · {c._events} אירועים
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',  label: 'סקירה'    },
  { key: 'bookings',  label: 'הזמנות'   },
  { key: 'leads',     label: 'לידים'    },
  { key: 'vendors',   label: 'ספקים'    },
  { key: 'clients',   label: 'לקוחות'   },
]

export default function AdminDashboard() {
  const { logout } = useSupplier()
  const [tab,     setTab]     = useState('overview')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error,   setError]   = useState(null)

  const [vendors, setVendors] = useState([])
  const [clients, setClients] = useState([])
  const [leads,   setLeads]   = useState([])
  const [events,  setEvents]  = useState([])

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const uid = auth.currentUser?.uid
      if (!uid) throw new Error('לא מחובר')

      // Check admin from users or vendors collection
      const [userDoc, vendorDoc] = await Promise.all([
        getDoc(doc(db, 'users', uid)),
        getDoc(doc(db, 'vendors', uid)),
      ])
      const adminFound =
        (userDoc.exists()   && userDoc.data().is_admin   === true) ||
        (vendorDoc.exists() && vendorDoc.data().is_admin === true)
      if (!adminFound) {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      setIsAdmin(true)

      const [vendorSnap, clientSnap, leadSnap, eventSnap] = await Promise.all([
        getDocs(collection(db, 'vendors')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'leads')),
        getDocs(collection(db, 'events')),
      ])
      setVendors(vendorSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setClients(clientSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLeads(leadSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setEvents(eventSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Admin load error:', err)
      setError(err.code === 'permission-denied'
        ? 'אין לך הרשאות אדמין. ודא שהוספת is_admin: true לדוקומנט שלך ב-Firestore.'
        : `שגיאה בטעינה: ${err.message}`)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  // ── Not admin ─────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 px-6"
        style={{ background: '#F5F0E8' }}>
        <AlertCircle size={40} style={{ color: '#E74C3C' }} />
        <p className="text-evo-text font-bold text-center">
          גישה לאדמין אסורה
        </p>
        <p className="text-evo-muted text-sm text-center">
          הוסף <code className="bg-gray-100 px-1 rounded">is_admin: true</code> לדוקומנט שלך ב-Firestore
        </p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen pb-8" style={{ background: '#F5F0E8' }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A1040 0%, #3D2B7A 100%)' }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider">EVO</p>
            <p className="text-white text-xl font-black">Admin Dashboard</p>
          </div>
          <button onClick={loadAll}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <RefreshCw size={16} className="text-white" />
          </button>
        </div>
        <p className="text-white/50 text-xs">
          {auth.currentUser?.email}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key)}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all"
            style={{
              background: tab === t.key ? '#3D2B7A' : '#EAE4DA',
              color:      tab === t.key ? '#fff'    : '#7A6A55',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#6B5FE4', borderTopColor: 'transparent' }} />
            <p className="text-evo-muted text-sm">טוען נתונים...</p>
          </div>
        ) : error ? (
          <div className="rounded-[16px] p-5 text-center space-y-3 mt-4"
            style={{ background: '#FDF0F0', border: '1.5px solid #F5C6CB' }}>
            <AlertCircle size={24} style={{ color: '#E74C3C', margin: '0 auto' }} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button onClick={loadAll}
              className="text-sm font-bold underline" style={{ color: '#E74C3C' }}>
              נסה שוב
            </button>
          </div>
        ) : (
          <>
            {tab === 'overview' && <OverviewTab vendors={vendors} clients={clients} leads={leads} events={events} />}
            {tab === 'bookings' && <BookingsTab leads={leads} vendors={vendors} clients={clients} />}
            {tab === 'leads'    && <LeadsTab    leads={leads} vendors={vendors} clients={clients} />}
            {tab === 'vendors'  && <VendorsTab  vendors={vendors} leads={leads} />}
            {tab === 'clients'  && <ClientsTab  clients={clients} leads={leads} events={events} />}
          </>
        )}
      </div>
    </div>
  )
}
