import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Clock, AlertCircle, Send } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const TABS = ['Brief', 'Timeline', 'Payments', 'EVO Chat']

export default function EventDetail() {
  const { activeEvent: evt, navigate } = useSupplier()
  const [tab, setTab]   = useState(0)
  const [msg, setMsg]   = useState('')
  const [msgs, setMsgs] = useState(evt?.messages || [])

  if (!evt) { navigate('home'); return null }

  const sendMsg = () => {
    if (!msg.trim()) return
    setMsgs(p => [...p, { id: Date.now(), from: 'supplier', text: msg, time: 'now' }])
    setMsg('')
    setTimeout(() => {
      setMsgs(p => [...p, { id: Date.now() + 1, from: 'evo', text: "Understood — I'll handle that and keep you updated.", time: 'now' }])
    }, 1200)
  }

  const statusColor = evt.status === 'confirmed' ? 'text-green-400' : evt.status === 'completed' ? 'text-evo-muted' : 'text-evo-accent'

  return (
    <div className="w-full min-h-screen bg-evo-black flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="relative h-52 shrink-0">
        <img src={evt.heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-evo-black" />
        <button onClick={() => navigate('home')}
          className="absolute top-12 left-5 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-6 right-6">
          <span className={`text-xs font-medium uppercase tracking-widest ${statusColor}`}>{evt.status}</span>
          <h1 className="text-white text-xl font-light mt-1 leading-tight">{evt.name}</h1>
          <p className="text-evo-muted text-xs mt-1">{evt.date} · {evt.location}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 border-b border-evo-border shrink-0">
        {[
          ['Guests', evt.guestCount],
          ['Package', evt.packageName],
          ['Value', `₪${(evt.totalValue / 1000).toFixed(0)}K`],
          ['Days', evt.daysAway > 0 ? evt.daysAway : '—'],
        ].map(([k, v]) => (
          <div key={k} className="py-3 text-center border-r border-evo-border last:border-0">
            <p className="text-white text-sm font-semibold">{v}</p>
            <p className="text-evo-dim text-[10px] mt-0.5">{k}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-evo-border shrink-0">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-3 text-xs font-medium tracking-wide transition-all border-b-2 ${tab === i ? 'text-white border-evo-accent' : 'text-evo-muted border-transparent hover:text-white/60'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 0 && (
            <motion.div key="brief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="px-6 py-5 space-y-6 pb-24">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-evo-muted mb-3">Style Direction</p>
                <p className="text-evo-muted text-sm font-light leading-relaxed">{evt.brief.style}</p>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-evo-muted mb-3">Colour Palette</p>
                <div className="flex gap-2">
                  {evt.brief.colorPalette.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-xl border border-white/10" style={{ backgroundColor: c }} />
                      <span className="text-evo-dim text-[9px]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              {evt.brief.keyRequirements.length > 0 && (
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-evo-muted mb-3">Key Requirements</p>
                  <div className="space-y-2">
                    {evt.brief.keyRequirements.map((r, i) => (
                      <div key={i} className="flex gap-3 items-start bg-evo-card rounded-xl border border-evo-border px-4 py-3">
                        <Check size={13} className="text-evo-accent shrink-0 mt-0.5" />
                        <p className="text-evo-muted text-sm font-light">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {evt.brief.venueNotes && (
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-evo-muted mb-3">Venue Notes</p>
                  <div className="bg-evo-card border border-evo-border rounded-2xl p-4">
                    <p className="text-evo-muted text-sm font-light leading-relaxed">{evt.brief.venueNotes}</p>
                  </div>
                </div>
              )}
              {evt.review && (
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-evo-muted mb-3">Client Review</p>
                  <div className="bg-evo-card border border-evo-border rounded-2xl p-5">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-evo-accent text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-white text-sm font-light leading-relaxed italic">"{evt.review.text}"</p>
                    <p className="text-evo-dim text-xs mt-3">{evt.review.date}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 1 && (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="px-6 py-5 pb-24">
              <div className="relative">
                <div className="absolute left-3 top-4 bottom-4 w-px bg-evo-border" />
                <div className="space-y-5">
                  {evt.timeline.map((item, i) => (
                    <div key={i} className="relative flex gap-5 items-start">
                      <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${item.status === 'done' ? 'border-green-400 bg-green-400/10' : item.urgent ? 'border-amber-400 bg-amber-400/10' : item.status === 'upcoming' ? 'border-evo-accent bg-evo-accent/10' : 'border-evo-border bg-evo-black'}`}>
                        {item.status === 'done' && <Check size={12} className="text-green-400" />}
                        {item.urgent && <AlertCircle size={12} className="text-amber-400" />}
                        {!item.status.includes('done') && !item.urgent && (
                          <div className={`w-2 h-2 rounded-full ${item.status === 'upcoming' ? 'bg-evo-accent' : 'bg-evo-dim'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${item.status === 'done' ? 'text-green-400' : item.urgent ? 'text-amber-400' : item.status === 'upcoming' ? 'text-white' : 'text-evo-muted'}`}>
                            {item.label}
                          </p>
                          <span className="text-evo-dim text-xs shrink-0">{item.date}</span>
                        </div>
                        {item.urgent && <p className="text-amber-400 text-xs mt-0.5">Action required</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 2 && (
            <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="px-6 py-5 space-y-4 pb-24">
              <div className="bg-evo-card rounded-2xl border border-evo-border p-5">
                <p className="text-xs tracking-[0.2em] uppercase text-evo-muted mb-4">Payment Summary</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-evo-muted text-sm">Total value</span>
                    <span className="text-white font-medium">₪{evt.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-evo-muted text-sm">Deposit received</span>
                    <span className="text-green-400 font-medium">₪{evt.depositPaid.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-evo-border" />
                  <div className="flex justify-between">
                    <span className="text-white text-sm font-medium">Remaining</span>
                    <span className="text-evo-accent text-lg font-light">₪{evt.remaining.toLocaleString()}</span>
                  </div>
                  {evt.remainingDue && (
                    <div className="flex justify-between">
                      <span className="text-evo-muted text-xs">Due date</span>
                      <span className="text-evo-muted text-xs">{evt.remainingDue}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-evo-card rounded-2xl border border-evo-border p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                <div>
                  <p className="text-white text-sm">Deposit paid — {evt.depositDate}</p>
                  <p className="text-evo-muted text-xs mt-0.5 font-light">Processed by EVO · ₪{evt.depositPaid.toLocaleString()}</p>
                </div>
              </div>
              {evt.remaining > 0 && (
                <div className="bg-evo-card rounded-2xl border border-evo-border/50 border-dashed p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-evo-border shrink-0" />
                  <div>
                    <p className="text-evo-muted text-sm">Final payment pending — {evt.remainingDue}</p>
                    <p className="text-evo-dim text-xs mt-0.5 font-light">EVO will process on event completion</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 3 && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="flex flex-col" style={{ height: 'calc(100vh - 320px)' }}>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {msgs.map(m => (
                  <div key={m.id} className={`flex gap-3 ${m.from === 'supplier' ? 'flex-row-reverse' : ''}`}>
                    {m.from === 'evo' && (
                      <div className="w-7 h-7 rounded-full bg-evo-accent/10 border border-evo-accent/30 flex items-center justify-center shrink-0">
                        <span className="text-evo-accent text-xs">E</span>
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${m.from === 'supplier' ? 'bg-evo-accent text-black' : 'bg-evo-card border border-evo-border text-white'}`}>
                      <p className="text-sm leading-relaxed font-light">{m.text}</p>
                      <p className={`text-[10px] mt-1.5 ${m.from === 'supplier' ? 'text-black/50' : 'text-evo-dim'}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-evo-border bg-evo-black pb-24">
                <div className="flex gap-3">
                  <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
                    placeholder="Message EVO..."
                    className="flex-1 bg-evo-card border border-evo-border rounded-xl px-4 py-3 text-white text-sm placeholder-evo-dim focus:outline-none focus:border-evo-accent/50 transition-colors" />
                  <button onClick={sendMsg} className="w-10 h-10 rounded-xl bg-evo-accent flex items-center justify-center active:scale-95">
                    <Send size={15} className="text-black" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
