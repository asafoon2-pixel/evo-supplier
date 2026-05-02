import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Check, X, Send, User, ShoppingBag } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { db } from '../firebase'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'

export default function LeadDetail() {
  const { activeLead: lead, navigate, goTab, acceptLead, declineLead, user, setActiveLead } = useSupplier()
  const [msg, setMsg] = useState('')
  const [msgs, setMsgs] = useState([])
  const [sending, setSending] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const bottomRef = useRef(null)

  // hooks must run unconditionally — guard inside each effect
  useEffect(() => {
    if (!lead?.id) return
    const q = query(collection(db, 'leads', lead.id, 'messages'), orderBy('time', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setMsgs(snap.docs.map(d => {
        const data = d.data()
        const time = data.time?.toDate ? data.time.toDate().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : ''
        return { id: d.id, from: data.from, text: data.text, time }
      }))
    })
    return unsub
  }, [lead?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  // early return only after all hooks
  if (!lead) { goTab('events'); return null }

  const isNew    = lead.status === 'new'
  const isBooked = lead.status === 'booked'
  const tasteProfile = lead.tasteProfile || []

  const sendMsg = async () => {
    const text = msg.trim()
    if (!text || sending) return
    setSending(true)
    setMsg('')
    try {
      await addDoc(collection(db, 'leads', lead.id, 'messages'), {
        sender_id:   user?.uid || '',
        sender_name: user?.displayName || 'ספק',
        from:        'vendor',
        text,
        time:        serverTimestamp(),
        read:        false,
      })
      await updateDoc(doc(db, 'leads', lead.id), {
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

  const details = [
    lead.eventType    && ['סוג אירוע',  lead.eventType],
    lead.date         && ['תאריך',       lead.date],
    lead.guestCount   && ['אורחים',      lead.guestCount],
    lead.location     && ['מיקום',       lead.location],
    lead.budgetRange  && ['תקציב',       lead.budgetRange],
    lead.client_name  && ['לקוח',        lead.client_name],
  ].filter(Boolean)

  return (
    <div className="w-full bg-evo-bg overflow-y-auto pb-32">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#2D1B8A] to-[#6B5FE4]">
        {lead.heroImage && (
          <img src={lead.heroImage} alt="" className="w-full h-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        <button onClick={() => { setActiveLead(null); goTab('events') }}
          className="absolute top-12 left-5 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            {lead.matchScore && (
              <div className="flex items-center gap-1.5 bg-evo-accent/20 border border-evo-accent/40 rounded-full px-3 py-1">
                <Zap size={11} className="text-evo-accent" />
                <span className="text-evo-accent text-xs font-bold">{lead.matchScore}% match</span>
              </div>
            )}
            {isBooked && <span className="text-evo-green bg-evo-green/20 border border-evo-green/30 text-xs font-bold px-3 py-1 rounded-full">הוזמן</span>}
            {isNew && <span className="text-white bg-evo-accent/80 border border-evo-accent text-xs font-bold px-3 py-1 rounded-full animate-pulse">חדש</span>}
          </div>
          <h1 className="text-white text-xl font-bold leading-tight">{lead.eventName || 'אירוע'}</h1>
          {lead.category && (
            <p className="text-white/70 text-xs mt-0.5">{lead.category}</p>
          )}
        </div>
      </div>

      <div className="px-6 space-y-5 pt-5">

        {/* Key details */}
        {details.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {details.map(([k, v]) => (
              <div key={k} className="bg-white rounded-xl border-[1.5px] border-evo-border p-3"
                style={{ boxShadow: 'rgba(45,27,105,0.06) 0px 2px 8px' }}>
                <p className="text-evo-muted text-[10px] font-bold tracking-[0.15em] uppercase mb-1">{k}</p>
                <p className="text-evo-text text-sm font-medium">{v}</p>
              </div>
            ))}
          </div>
        )}

        {/* Client info */}
        {lead.client_email && (
          <div className="bg-white rounded-xl border-[1.5px] border-evo-border p-3 flex items-center gap-3"
            style={{ boxShadow: 'rgba(45,27,105,0.06) 0px 2px 8px' }}>
            <div className="w-8 h-8 rounded-full bg-evo-elevated flex items-center justify-center shrink-0">
              <User size={14} className="text-evo-purple" />
            </div>
            <div>
              <p className="text-sm font-semibold text-evo-text">{lead.client_name || 'לקוח'}</p>
              <p className="text-xs text-evo-muted">{lead.client_email}</p>
            </div>
          </div>
        )}

        {/* Taste profile */}
        {tasteProfile.length > 0 && (
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">פרופיל טעם האירוע</p>
            <div className="flex gap-2 flex-wrap">
              {tasteProfile.map(tag => (
                <span key={tag} className="text-xs text-evo-purple font-bold border-[1.5px] border-evo-dim bg-evo-elevated rounded-full px-3 py-1.5">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* EVO note */}
        {lead.evoNote && (
          <div className="bg-white border-l-[3px] border-evo-accent border-[1.5px] border-evo-border rounded-[20px] p-5"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-evo-accent" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent">למה EVO התאים אותך</p>
            </div>
            <p className="text-evo-muted text-sm leading-relaxed">{lead.evoNote}</p>
          </div>
        )}

        {/* Suggested package */}
        {lead.suggestedPackage && (
          <div className="bg-evo-elevated rounded-[20px] border-[1.5px] border-evo-dim p-5">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">EVO ממליץ</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-evo-text font-bold">חבילת {lead.suggestedPackage}</p>
                <p className="text-evo-muted text-sm mt-0.5">הכי מתאים לסדר הגודל של האירוע</p>
              </div>
              {lead.suggestedPrice && (
                <p className="text-evo-accent text-xl font-bold">₪{lead.suggestedPrice.toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {/* What was ordered */}
        {((lead.order_items && lead.order_items.length > 0) || lead.suggestedPrice) && (
          <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border overflow-hidden"
            style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
            <div className="flex items-center gap-2 px-5 py-4 border-b border-evo-border bg-evo-elevated">
              <ShoppingBag size={14} className="text-evo-purple" />
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-purple">מה הלקוח הזמין</p>
            </div>
            <div className="divide-y divide-evo-border">
              {(!lead.order_items || lead.order_items.length === 0) && lead.suggestedPackage && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-evo-muted bg-evo-elevated border border-evo-dim rounded-full px-2 py-0.5 shrink-0">חבילה</span>
                    <p className="text-sm font-medium text-evo-text truncate">{lead.suggestedPackage}</p>
                  </div>
                  {lead.suggestedPrice && (
                    <p className="text-sm font-bold text-evo-text shrink-0 ml-3">₪{lead.suggestedPrice.toLocaleString()}</p>
                  )}
                </div>
              )}
              {lead.order_items && lead.order_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-evo-muted bg-evo-elevated border border-evo-dim rounded-full px-2 py-0.5 shrink-0">
                      {item.type === 'package' ? 'חבילה' : item.type === 'product' ? 'מוצר' : item.type || 'פריט'}
                    </span>
                    <p className="text-sm font-medium text-evo-text truncate">{item.item_name || item.name || ''}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-3">
                    {item.quantity > 1 && (
                      <span className="text-xs text-evo-muted">x{item.quantity}</span>
                    )}
                    <p className="text-sm font-bold text-evo-text">₪{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {(lead.order_total > 0 || (lead.order_items && lead.order_items.length > 0) || lead.suggestedPrice) && (
              <div className="flex items-center justify-between px-5 py-4 bg-evo-elevated border-t-[1.5px] border-evo-border">
                <p className="text-sm font-bold text-evo-text">סה״כ להזמנה</p>
                <p className="text-lg font-bold text-evo-purple">
                  ₪{(lead.order_total > 0
                    ? lead.order_total
                    : lead.order_items && lead.order_items.length > 0
                      ? lead.order_items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0)
                      : lead.suggestedPrice || 0
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-4">צ׳אט עם הלקוח</p>
          <div className="space-y-3 mb-4">
            {msgs.length === 0 && (
              <p className="text-evo-muted text-xs text-center py-4">אין הודעות עדיין — שלח הודעה ראשונה</p>
            )}
            {msgs.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.from === 'vendor' ? 'flex-row-reverse' : ''}`}>
                {m.from !== 'vendor' && (
                  <div className="w-7 h-7 rounded-full bg-evo-elevated border-[1.5px] border-evo-dim flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-evo-accent text-xs font-bold">{m.from === 'client' ? lead.client_name?.[0]?.toUpperCase() || 'L' : 'E'}</span>
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
          <div className="flex gap-3">
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="שלח הודעה ללקוח..."
              className="flex-1 bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-sm placeholder-evo-muted focus:outline-none focus:border-evo-purple-mid transition-colors" />
            <button onClick={sendMsg} disabled={sending}
              className="w-10 h-10 rounded-xl bg-evo-purple-mid flex items-center justify-center hover:bg-evo-purple transition-all active:scale-95 disabled:opacity-50"
              style={{ boxShadow: 'rgba(45,27,105,0.35) 0px 4px 12px' }}>
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky actions */}
      {isNew && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-evo-border px-6 py-4 z-30">
          <div className="flex gap-3">
            <button onClick={() => setShowDeclineModal(true)}
              className="flex-1 py-3.5 rounded-[14px] border-2 border-evo-border text-evo-muted text-sm font-semibold hover:border-evo-dim hover:text-evo-text transition-all flex items-center justify-center gap-2">
              <X size={15} />
              דחה
            </button>
            <button onClick={() => { acceptLead(lead.id); navigate('home') }}
              className="flex-[2] py-3.5 rounded-[14px] bg-evo-purple-mid text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-evo-purple transition-all active:scale-[0.98]"
              style={{ boxShadow: 'rgba(45,27,105,0.35) 0px 4px 16px' }}>
              <Check size={15} />
              קבל ליד
            </button>
          </div>
        </div>
      )}

      {isBooked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-evo-border px-6 py-4 z-30">
          <button onClick={() => goTab('events')}
            className="w-full py-4 rounded-[14px] border-2 border-evo-purple-mid text-evo-purple-mid text-sm font-semibold tracking-wider uppercase hover:bg-evo-purple-mid hover:text-white transition-all">
            צפה באירועים
          </button>
        </div>
      )}

      {/* Decline modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowDeclineModal(false)}>
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[430px] bg-white rounded-t-[24px] px-6 pt-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-evo-border mx-auto mb-5" />
            <h3 className="text-[17px] font-extrabold text-evo-text mb-1">סיבת הדחייה</h3>
            <p className="text-evo-muted text-sm mb-4">הלקוח יראה את הסיבה ויקבל הצעות לספקים חלופיים</p>
            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              rows={3}
              placeholder="לדוגמה: אין זמינות בתאריך המבוקש, התקציב לא מתאים..."
              className="w-full bg-evo-bg border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-sm placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-3.5 rounded-[14px] border-2 border-evo-border text-evo-muted text-sm font-semibold">
                ביטול
              </button>
              <button
                disabled={!declineReason.trim()}
                onClick={() => {
                  declineLead(lead.id, declineReason.trim())
                  setShowDeclineModal(false)
                  navigate('home')
                }}
                className="flex-[2] py-3.5 rounded-[14px] text-white text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: '#EF4444' }}
              >
                אשר דחייה
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
