import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, AlertCircle, Send } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { db } from '../firebase'
import {
  collection, query, where, getDocs,
  addDoc, orderBy, onSnapshot, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore'

const TABS = ['בריף', 'ציר זמן', 'תשלומים', "צ'אט עם לקוח"]

export default function EventDetail() {
  const { activeEvent: evt, navigate, goTab, user, setActiveEvent } = useSupplier()
  const [tab, setTab]   = useState(0)
  const [msg, setMsg]   = useState('')
  const [msgs, setMsgs] = useState([])
  const [leadId, setLeadId] = useState(null)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  // Find matching lead for this event (vendor_id + client_id)
  useEffect(() => {
    if (!evt?.vendor_id || !evt?.client_id) return
    const q = query(
      collection(db, 'leads'),
      where('vendor_id', '==', evt.vendor_id),
      where('client_id', '==', evt.client_id)
    )
    getDocs(q).then(snap => {
      if (!snap.empty) setLeadId(snap.docs[0].id)
    }).catch(() => {})
  }, [evt?.vendor_id, evt?.client_id])

  // Listen to messages in real-time
  useEffect(() => {
    if (!leadId) return
    const q = query(collection(db, 'leads', leadId, 'messages'), orderBy('time', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setMsgs(snap.docs.map(d => {
        const data = d.data()
        return {
          id:   d.id,
          from: data.from,
          text: data.text,
          time: data.time?.toDate ? data.time.toDate().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '',
        }
      }))
    })
    return unsub
  }, [leadId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  if (!evt) { goTab('events'); return null }

  const sendMsg = async () => {
    const text = msg.trim()
    if (!text || sending || !leadId) return
    setSending(true)
    setMsg('')
    try {
      await addDoc(collection(db, 'leads', leadId, 'messages'), {
        sender_id:   user?.uid || '',
        sender_name: user?.displayName || 'ספק',
        from:        'vendor',
        text,
        time:        serverTimestamp(),
        read:        false,
      })
      await updateDoc(doc(db, 'leads', leadId), {
        last_message:    text,
        last_message_at: serverTimestamp(),
        updated_at:      serverTimestamp(),
      })
    } catch (e) {
      console.error('sendMsg error:', e)
    } finally {
      setSending(false)
    }
  }

  const statusColor = evt.status === 'confirmed' ? 'text-evo-green' : evt.status === 'completed' ? 'text-evo-muted' : 'text-evo-accent'

  return (
    <div className="w-full bg-evo-bg flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="relative h-52 shrink-0 bg-gradient-to-br from-[#2D1B8A] to-[#6B5FE4]">
        {evt.heroImage && <img src={evt.heroImage} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        <button onClick={() => { setActiveEvent(null); goTab('events') }}
          className="absolute top-12 left-5 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="absolute bottom-4 left-6 right-6">
          <span className={`text-xs font-bold uppercase tracking-widest ${statusColor}`}>{evt.status}</span>
          <h1 className="text-white text-xl font-bold mt-1 leading-tight">{evt.name}</h1>
          <p className="text-white/70 text-xs mt-1">{evt.date} · {evt.location}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 border-b border-evo-border shrink-0 bg-white">
        {[
          ['אורחים', evt.guestCount],
          ['חבילה', evt.packageName],
          ['שווי', evt.totalValue ? `₪${(evt.totalValue / 1000).toFixed(0)}K` : '—'],
          ['ימים', evt.daysAway > 0 ? evt.daysAway : '—'],
        ].map(([k, v]) => (
          <div key={k} className="py-3 text-center border-r border-evo-border last:border-0">
            <p className="text-evo-text text-sm font-bold">{v}</p>
            <p className="text-evo-muted text-[10px] mt-0.5">{k}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-evo-border shrink-0 bg-white">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-3 text-xs font-bold tracking-wide transition-all border-b-2 ${tab === i ? 'text-evo-accent border-evo-accent' : 'text-evo-muted border-transparent hover:text-evo-text'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 0 && (
            <motion.div key="brief" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="px-6 py-5 space-y-6 pb-8">
              {evt.brief?.style && (
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">כיוון סגנון</p>
                  <p className="text-evo-muted text-sm leading-relaxed">{evt.brief.style}</p>
                </div>
              )}
              {evt.brief?.colorPalette?.length > 0 && (
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">פלטת צבעים</p>
                  <div className="flex gap-2">
                    {evt.brief.colorPalette.map((c, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 rounded-xl border border-evo-border" style={{ backgroundColor: c }} />
                        <span className="text-evo-muted text-[9px]">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {evt.brief?.keyRequirements?.length > 0 && (
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">דרישות עיקריות</p>
                  <div className="space-y-2">
                    {evt.brief.keyRequirements.map((r, i) => (
                      <div key={i} className="flex gap-3 items-start bg-white rounded-xl border-[1.5px] border-evo-border px-4 py-3">
                        <Check size={13} className="text-evo-accent shrink-0 mt-0.5" />
                        <p className="text-evo-muted text-sm">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {evt.brief?.venueNotes && (
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">הערות מקום</p>
                  <div className="bg-white border-[1.5px] border-evo-border rounded-[20px] p-4">
                    <p className="text-evo-muted text-sm leading-relaxed">{evt.brief.venueNotes}</p>
                  </div>
                </div>
              )}
              {!evt.brief && (
                <div className="text-center py-10">
                  <p className="text-evo-muted text-sm">אין בריף לאירוע זה עדיין</p>
                </div>
              )}
              {evt.review && (
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">ביקורת לקוח</p>
                  <div className="bg-white border-[1.5px] border-evo-border rounded-[20px] p-5">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-evo-accent text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-evo-text text-sm leading-relaxed italic">"{evt.review.text}"</p>
                    <p className="text-evo-muted text-xs mt-3">{evt.review.date}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 1 && (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="px-6 py-5 pb-8">
              {!evt.timeline?.length && (
                <p className="text-evo-muted text-sm text-center py-10">אין ציר זמן לאירוע זה עדיין</p>
              )}
              <div className="relative">
                <div className="absolute left-3 top-4 bottom-4 w-px bg-evo-border" />
                <div className="space-y-5">
                  {(evt.timeline || []).map((item, i) => (
                    <div key={i} className="relative flex gap-5 items-start">
                      <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        item.status === 'done' ? 'border-evo-green bg-evo-green/10' :
                        item.urgent ? 'border-amber-400 bg-amber-50' :
                        item.status === 'upcoming' ? 'border-evo-accent bg-evo-elevated' :
                        'border-evo-border bg-white'
                      }`}>
                        {item.status === 'done' && <Check size={12} className="text-evo-green" />}
                        {item.urgent && <AlertCircle size={12} className="text-amber-400" />}
                        {!(item.status || '').includes('done') && !item.urgent && (
                          <div className={`w-2 h-2 rounded-full ${item.status === 'upcoming' ? 'bg-evo-accent' : 'bg-evo-dim'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${
                            item.status === 'done' ? 'text-evo-green' :
                            item.urgent ? 'text-amber-500' :
                            item.status === 'upcoming' ? 'text-evo-text' :
                            'text-evo-muted'
                          }`}>
                            {item.label}
                          </p>
                          <span className="text-evo-muted text-xs shrink-0">{item.date}</span>
                        </div>
                        {item.urgent && <p className="text-amber-500 text-xs mt-0.5">נדרשת פעולה</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 2 && (
            <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="px-6 py-5 space-y-4 pb-8">
              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5"
                style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-4">סיכום תשלומים</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-evo-muted text-sm">שווי כולל</span>
                    <span className="text-evo-text font-semibold">{evt.totalValue ? `₪${evt.totalValue.toLocaleString()}` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-evo-muted text-sm">מקדמה התקבלה</span>
                    <span className="text-evo-green font-semibold">{evt.depositPaid ? `₪${evt.depositPaid.toLocaleString()}` : '—'}</span>
                  </div>
                  <div className="h-px bg-evo-border" />
                  <div className="flex justify-between">
                    <span className="text-evo-text text-sm font-semibold">יתרה לתשלום</span>
                    <span className="text-evo-accent text-lg font-bold">{evt.remaining != null ? `₪${evt.remaining.toLocaleString()}` : '—'}</span>
                  </div>
                  {evt.remainingDue && (
                    <div className="flex justify-between">
                      <span className="text-evo-muted text-xs">מועד תשלום</span>
                      <span className="text-evo-muted text-xs">{evt.remainingDue}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-evo-green shrink-0" />
                <div>
                  <p className="text-evo-text text-sm font-medium">מקדמה שולמה — {evt.depositDate || ''}</p>
                  <p className="text-evo-muted text-xs mt-0.5">עובד ע"י EVO{evt.depositPaid ? ` · ₪${evt.depositPaid.toLocaleString()}` : ''}</p>
                </div>
              </div>
              {(evt.remaining || 0) > 0 && (
                <div className="bg-white rounded-[20px] border-[1.5px] border-dashed border-evo-border p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-evo-dim shrink-0" />
                  <div>
                    <p className="text-evo-muted text-sm">תשלום סופי ממתין — {evt.remainingDue}</p>
                    <p className="text-evo-muted text-xs mt-0.5">EVO יעבד עם סיום האירוע</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === 3 && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="flex flex-col" style={{ height: 'calc(100vh - 320px)' }}>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {!leadId && (
                  <p className="text-center text-xs text-evo-muted py-8">מחפש שיחה עם הלקוח...</p>
                )}
                {leadId && msgs.length === 0 && (
                  <p className="text-center text-xs text-evo-muted py-8">אין הודעות עדיין — שלח הודעה ראשונה ללקוח</p>
                )}
                {msgs.map(m => (
                  <div key={m.id} className={`flex gap-3 ${m.from === 'vendor' ? 'flex-row-reverse' : ''}`}>
                    {m.from !== 'vendor' && (
                      <div className="w-7 h-7 rounded-full bg-evo-elevated border-[1.5px] border-evo-dim flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-evo-accent text-xs font-bold">
                          {m.from === 'client' ? (evt.client_name?.[0]?.toUpperCase() || 'L') : 'E'}
                        </span>
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${m.from === 'vendor' ? 'bg-evo-purple-mid text-white' : 'bg-white border-[1.5px] border-evo-border text-evo-text'}`}
                      style={m.from !== 'vendor' ? { boxShadow: 'rgba(45,27,105,0.06) 0px 2px 8px' } : {}}>
                      <p className="text-sm leading-relaxed">{m.text}</p>
                      {m.time && <p className={`text-[10px] mt-1.5 ${m.from === 'vendor' ? 'text-white/60' : 'text-evo-muted'}`}>{m.time}</p>}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="px-6 py-4 border-t border-evo-border bg-white">
                <div className="flex gap-3">
                  <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
                    placeholder={leadId ? `שלח הודעה ל${evt.client_name || 'לקוח'}...` : 'טוען...'}
                    disabled={!leadId || sending}
                    className="flex-1 bg-evo-bg border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-sm placeholder-evo-muted focus:outline-none focus:border-evo-purple-mid transition-colors disabled:opacity-50" />
                  <button onClick={sendMsg} disabled={!leadId || sending}
                    className="w-10 h-10 rounded-xl bg-evo-purple-mid flex items-center justify-center active:scale-95 disabled:opacity-50"
                    style={{ boxShadow: 'rgba(45,27,105,0.35) 0px 4px 12px' }}>
                    <Send size={15} className="text-white" />
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
