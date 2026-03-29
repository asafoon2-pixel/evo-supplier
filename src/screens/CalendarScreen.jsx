import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { events } from '../data/index'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

// Booked dates from events data (month is 0-indexed)
const bookedDates = [
  { year: 2026, month: 3, day: 12 },  // April 12
  { year: 2026, month: 4, day: 3 },   // May 3
]

// Blocked out dates (manually set by supplier)
const blockedDates = [
  { year: 2026, month: 2, day: 26 },
  { year: 2026, month: 2, day: 27 },
  { year: 2026, month: 2, day: 28 },
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function sameDate(a, b) {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

export default function CalendarScreen() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [blocked, setBlocked] = useState(blockedDates)
  const [selectedDay, setSelectedDay] = useState(null)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const toggleBlock = (day) => {
    const d = { year: viewYear, month: viewMonth, day }
    const isBooked = bookedDates.some(b => sameDate(b, d))
    if (isBooked) return
    setBlocked(prev => {
      const exists = prev.some(b => sameDate(b, d))
      return exists ? prev.filter(b => !sameDate(b, d)) : [...prev, d]
    })
    setSelectedDay(day)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const upcomingEvents = events.filter(e => e.status !== 'completed')

  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white border-b border-evo-border">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>Availability</h1>
        <p className="text-evo-muted text-sm mt-1">Block dates you're unavailable</p>
      </div>

      {/* Calendar */}
      <div className="px-6 mt-5 mb-5">
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border-[1.5px] border-evo-border flex items-center justify-center hover:border-evo-dim transition-colors">
              <ChevronLeft size={14} className="text-evo-muted" />
            </button>
            <p className="text-evo-text font-bold">{MONTHS[viewMonth]} {viewYear}</p>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border-[1.5px] border-evo-border flex items-center justify-center hover:border-evo-dim transition-colors">
              <ChevronRight size={14} className="text-evo-muted" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <p key={d} className="text-evo-muted text-xs text-center font-bold">{d}</p>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const d = { year: viewYear, month: viewMonth, day }
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
              const isBooked = bookedDates.some(b => sameDate(b, d))
              const isBlocked = blocked.some(b => sameDate(b, d))
              const isPast = new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

              return (
                <button
                  key={day}
                  onClick={() => !isPast && toggleBlock(day)}
                  disabled={isPast}
                  className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all
                    ${isBooked ? 'bg-evo-accent/20 text-evo-accent border-[1.5px] border-evo-dim cursor-default' :
                      isBlocked ? 'bg-evo-elevated text-evo-muted border-[1.5px] border-evo-border line-through' :
                      isToday ? 'border-[1.5px] border-evo-purple-mid text-evo-purple-mid font-bold' :
                      isPast ? 'text-evo-muted opacity-30' :
                      'text-evo-text hover:bg-evo-elevated'}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-evo-border">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-evo-accent/20 border-[1.5px] border-evo-dim" />
              <p className="text-evo-muted text-xs">Booked</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-evo-elevated border-[1.5px] border-evo-border" />
              <p className="text-evo-muted text-xs">Blocked</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-[1.5px] border-evo-purple-mid" />
              <p className="text-evo-muted text-xs">Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming booked events */}
      <div className="px-6">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-4">Booked Dates</p>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 flex items-center gap-4"
              style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <img src={event.heroImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-evo-text text-sm font-semibold truncate">{event.name}</p>
                <p className="text-evo-muted text-xs mt-0.5">{event.date}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-evo-accent" />
                  <p className="text-evo-accent text-xs font-medium">{event.daysAway}d away</p>
                </div>
                <p className="text-evo-muted text-xs mt-0.5">{event.eventType}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* EVO note */}
      <div className="px-6 mt-5">
        <div className="bg-white rounded-[20px] border-l-[3px] border-evo-accent border-[1.5px] border-evo-border p-4"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent mb-2">EVO Matching</p>
          <p className="text-evo-muted text-xs leading-relaxed">
            Keep your calendar updated. EVO only sends you leads for dates you're available — blocking dates ensures better match quality.
          </p>
        </div>
      </div>
    </div>
  )
}
