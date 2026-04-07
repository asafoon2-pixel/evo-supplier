import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const DAYS   = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני',
                'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SCOPES    = 'https://www.googleapis.com/auth/calendar.events'

const bookedDates = [
  { year: 2026, month: 3, day: 12 },
  { year: 2026, month: 4, day: 3  },
]

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay() }
function sameDate(a, b)       { return a.year === b.year && a.month === b.month && a.day === b.day }


export default function CalendarScreen() {
  const { events } = useSupplier()
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [blocked,   setBlocked]   = useState([
    { year: 2026, month: 2, day: 26 },
    { year: 2026, month: 2, day: 27 },
    { year: 2026, month: 2, day: 28 },
  ])

  // Google Calendar state
  const [gConnected,   setGConnected]   = useState(false)
  const [gLoading,     setGLoading]     = useState(false)
  const [syncedCount,  setSyncedCount]  = useState(0)
  const [accessToken,  setAccessToken]  = useState(null)
  const [gError,       setGError]       = useState(null)
  const [scriptReady,  setScriptReady]  = useState(false)

  // Load Google Identity Services script
  useEffect(() => {
    if (window.google?.accounts) { setScriptReady(true); return }
    const s = document.createElement('script')
    s.src   = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => setScriptReady(true)
    s.onerror = () => setGError('Failed to load Google Identity Services')
    document.head.appendChild(s)
    return () => { if (document.head.contains(s)) document.head.removeChild(s) }
  }, [])

  const syncToGoogle = useCallback(async (token) => {
    setGLoading(true)
    setGError(null)
    const eventsToSync = events.filter(e => e.status !== 'completed')
    let count = 0
    try {
      for (const evt of eventsToSync) {
        // Parse date string to a Date object — fallback to today if unparseable
        const dateObj = evt.date ? new Date(evt.date) : new Date()
        const isValid = !isNaN(dateObj.getTime())
        const dateStr = isValid
          ? dateObj.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
        const nextDay = new Date(isValid ? dateObj : new Date())
        nextDay.setDate(nextDay.getDate() + 1)
        const nextDayStr = nextDay.toISOString().split('T')[0]

        const body = {
          summary: `EVO — ${evt.name || evt.eventType || 'אירוע'}`,
          description: `${evt.eventType || ''} · ${evt.guestCount || ''} אורחים · ₪${evt.totalValue?.toLocaleString() || ''}`.trim(),
          start: { date: dateStr },
          end:   { date: nextDayStr },
          colorId: '7', // peacock
        }

        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }
        )
        if (res.ok) count++
      }
      setSyncedCount(count)
      setGConnected(true)
    } catch (err) {
      setGError('שגיאה בסנכרון — נסה שנית')
    } finally {
      setGLoading(false)
    }
  }, [events])

  const connectGoogle = () => {
    if (!scriptReady || !window.google?.accounts) {
      setGError('שירותי Google לא מוכנים — נסה שנית')
      return
    }
    if (!CLIENT_ID) {
      setGError('Google Client ID לא מוגדר (הגדר VITE_GOOGLE_CLIENT_ID)')
      return
    }
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) { setGError('הרשאה נכשלה: ' + resp.error); return }
        setAccessToken(resp.access_token)
        syncToGoogle(resp.access_token)
      },
    })
    tokenClient.requestAccessToken()
  }

  const refreshGoogle = () => {
    if (accessToken) syncToGoogle(accessToken)
    else connectGoogle()
  }

  const disconnect = () => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken)
    }
    setGConnected(false)
    setSyncedCount(0)
    setAccessToken(null)
  }

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1)
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1)

  const toggleBlock = (day) => {
    const d = { year: viewYear, month: viewMonth, day }
    if (bookedDates.some(b => sameDate(b, d))) return
    setBlocked(prev => prev.some(b => sameDate(b, d)) ? prev.filter(b => !sameDate(b, d)) : [...prev, d])
  }

  const cells = [
    ...Array(getFirstDay(viewYear, viewMonth)).fill(null),
    ...Array.from({ length: getDaysInMonth(viewYear, viewMonth) }, (_, i) => i + 1),
  ]

  const upcomingEvo = events.filter(e => e.status !== 'completed')

  return (
    <div className="w-full bg-evo-bg pb-8">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-evo-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
            <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>לוח שנה</h1>
            <p className="text-evo-muted text-sm mt-1 font-medium">נהל זמינות וסנכרן יומן Google</p>
          </div>
          {gConnected && (
            <div className="flex items-center gap-2">
              <button onClick={refreshGoogle} disabled={gLoading}
                className="w-8 h-8 rounded-full bg-evo-elevated border-[1.5px] border-evo-dim flex items-center justify-center">
                <RefreshCw size={14} className={`text-evo-accent ${gLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Calendar connect banner */}
      {!gConnected && (
        <div className="px-6 mt-5">
          <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
            <div className="flex items-center gap-3 mb-4">
              {/* Google Calendar icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-extrabold text-evo-text">חבר יומן Google</p>
                <p className="text-xs text-evo-muted font-medium mt-0.5">סנכרן את הלו"ז — ללא כפילויות</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {[
                'אירועי EVO יופיעו ביומן Google שלך',
                'לא תפספס אף אירוע — הכל במקום אחד',
                'מתעדכן אוטומטי עם כל סנכרון',
              ].map(txt => (
                <div key={txt} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-evo-green/15 flex items-center justify-center shrink-0">
                    <span className="text-evo-green text-[10px] font-extrabold">✓</span>
                  </div>
                  <p className="text-xs text-evo-muted font-semibold">{txt}</p>
                </div>
              ))}
            </div>
            {gError && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-evo-red/10 border border-evo-red/20">
                <p className="text-xs text-evo-red font-semibold">{gError}</p>
              </div>
            )}
            <button onClick={connectGoogle} disabled={gLoading}
              className="w-full py-3 px-6 text-center text-white text-sm font-extrabold rounded-[14px] transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#2D1B8A', boxShadow: '0 4px 20px rgba(45,27,105,0.35)' }}>
              {gLoading ? 'מסנכרן...' : 'סנכרן אירועים ליומן Google'}
            </button>
          </div>
        </div>
      )}

      {/* Connected badge */}
      {gConnected && (
        <div className="px-6 mt-5">
          <div className="flex items-center justify-between bg-evo-green/10 border-[1.5px] border-evo-green/30 rounded-[16px] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-evo-green animate-pulse" />
              <p className="text-sm font-bold text-evo-green">יומן Google מסונכרן</p>
              <span className="text-xs text-evo-muted font-medium">· {syncedCount} אירועים נוספו</span>
            </div>
            <button onClick={disconnect} className="text-xs font-bold text-evo-muted underline">נתק</button>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div className="px-6 mt-5 mb-5">
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth}
              className="w-8 h-8 rounded-full border-[1.5px] border-evo-border flex items-center justify-center hover:border-evo-dim transition-colors">
              <ChevronLeft size={14} className="text-evo-muted" />
            </button>
            <p className="text-evo-text font-extrabold">{MONTHS[viewMonth]} {viewYear}</p>
            <button onClick={nextMonth}
              className="w-8 h-8 rounded-full border-[1.5px] border-evo-border flex items-center justify-center hover:border-evo-dim transition-colors">
              <ChevronRight size={14} className="text-evo-muted" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => <p key={d} className="text-evo-muted text-xs text-center font-bold">{d}</p>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />
              const d       = { year: viewYear, month: viewMonth, day }
              const isToday   = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
              const isBooked  = bookedDates.some(b => sameDate(b, d))
              const isBlocked = blocked.some(b => sameDate(b, d))
              const isPast    = new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
              return (
                <button key={day} onClick={() => !isPast && toggleBlock(day)} disabled={isPast}
                  className={`aspect-square rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all relative
                    ${isBooked  ? 'bg-evo-accent/20 text-evo-accent border-[1.5px] border-evo-dim cursor-default' :
                      isBlocked ? 'bg-evo-elevated text-evo-muted border-[1.5px] border-evo-border line-through' :
                      isToday   ? 'border-[1.5px] border-evo-purple-mid text-evo-purple-mid' :
                      isPast    ? 'text-evo-muted opacity-30' :
                                  'text-evo-text hover:bg-evo-elevated'}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-evo-border flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-evo-accent/20 border-[1.5px] border-evo-dim" />
              <p className="text-evo-muted text-xs font-medium">EVO הזמין</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-evo-elevated border-[1.5px] border-evo-border" />
              <p className="text-evo-muted text-xs font-medium">חסום</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-[1.5px] border-evo-purple-mid" />
              <p className="text-evo-muted text-xs font-medium">היום</p>
            </div>
          </div>
        </div>
      </div>

      {/* EVO booked events */}
      <div className="px-6">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-3">תאריכים שEVO הזמין</p>
        {upcomingEvo.length === 0 && (
          <p className="text-evo-muted text-xs font-medium py-2">אין אירועים מתוזמנים עדיין</p>
        )}
        <div className="space-y-3">
          {upcomingEvo.map(event => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 flex items-center gap-4"
              style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <img src={event.heroImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-evo-text text-sm font-bold truncate">{event.name}</p>
                <p className="text-evo-muted text-xs font-medium mt-0.5">{event.date}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-evo-accent" />
                  <p className="text-evo-accent text-xs font-bold">בעוד {event.daysAway} ימים</p>
                </div>
                <p className="text-evo-muted text-xs mt-0.5 font-medium">{event.eventType}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* EVO note */}
      <div className="px-6 mt-5">
        <div className="bg-white rounded-[20px] border-l-[3px] border-evo-accent border-[1.5px] border-evo-border p-4">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent mb-2">התאמת EVO</p>
          <p className="text-evo-muted text-xs leading-relaxed font-medium">
            שמור על הלוח מעודכן. EVO שולח לידים רק בתאריכים שאתה פנוי — חסימת תאריכים משפרת את איכות ההתאמה.
          </p>
        </div>
      </div>
    </div>
  )
}
