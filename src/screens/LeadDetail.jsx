import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Check, X, Send } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

export default function LeadDetail() {
  const { activeLead: lead, navigate, goTab, acceptLead, declineLead } = useSupplier()
  const [msg, setMsg] = useState('')
  const [msgs, setMsgs] = useState([
    { id: 1, from: 'evo', text: `EVO matched this event to your profile. Match score: ${lead?.matchScore}%. Here's the full brief.`, time: lead?.receivedAt },
  ])

  if (!lead) { navigate('home'); return null }

  const isNew    = lead.status === 'new'
  const isBooked = lead.status === 'booked'

  const sendMsg = () => {
    if (!msg.trim()) return
    setMsgs(prev => [...prev, { id: Date.now(), from: 'supplier', text: msg, time: 'now' }])
    setMsg('')
    setTimeout(() => {
      setMsgs(prev => [...prev, { id: Date.now() + 1, from: 'evo', text: "Got it — I'll pass this to the client and update you shortly.", time: 'now' }])
    }, 1200)
  }

  return (
    <div className="w-full bg-evo-bg overflow-y-auto pb-32">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <img src={lead.heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        <button onClick={() => navigate('home')}
          className="absolute top-12 left-5 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 bg-evo-accent/20 border border-evo-accent/40 rounded-full px-3 py-1">
              <Zap size={11} className="text-evo-accent" />
              <span className="text-evo-accent text-xs font-bold">{lead.matchScore}% match</span>
            </div>
            {isBooked && <span className="text-evo-green bg-evo-green/20 border border-evo-green/30 text-xs font-bold px-3 py-1 rounded-full">Booked</span>}
            {isNew && <span className="text-white bg-evo-accent/80 border border-evo-accent text-xs font-bold px-3 py-1 rounded-full animate-pulse">New</span>}
          </div>
          <h1 className="text-white text-xl font-bold leading-tight">{lead.eventName}</h1>
        </div>
      </div>

      <div className="px-6 space-y-5 pt-5">
        {/* Key details */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Event type', lead.eventType],
            ['Date', lead.date],
            ['Guests', `${lead.guestCount} people`],
            ['Location', lead.location],
            ['Budget', lead.budgetRange],
            ['Expires', lead.expiresIn ? `In ${lead.expiresIn}` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl border-[1.5px] border-evo-border p-3"
              style={{ boxShadow: 'rgba(45,27,105,0.06) 0px 2px 8px' }}>
              <p className="text-evo-muted text-[10px] font-bold tracking-[0.15em] uppercase mb-1">{k}</p>
              <p className="text-evo-text text-sm font-medium">{v}</p>
            </div>
          ))}
        </div>

        {/* Taste profile */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">Event Taste Profile</p>
          <div className="flex gap-2 flex-wrap">
            {lead.tasteProfile.map(tag => (
              <span key={tag} className="text-xs text-evo-purple font-bold border-[1.5px] border-evo-dim bg-evo-elevated rounded-full px-3 py-1.5">{tag}</span>
            ))}
          </div>
        </div>

        {/* EVO note */}
        <div className="bg-white border-l-[3px] border-evo-accent border-[1.5px] border-evo-border rounded-[20px] p-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} className="text-evo-accent" />
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent">Why EVO matched you</p>
          </div>
          <p className="text-evo-muted text-sm leading-relaxed">{lead.evoNote}</p>
        </div>

        {/* Suggested package */}
        <div className="bg-evo-elevated rounded-[20px] border-[1.5px] border-evo-dim p-5">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-3">EVO Suggests</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-evo-text font-bold">{lead.suggestedPackage} Package</p>
              <p className="text-evo-muted text-sm mt-0.5">Best fit for this event's scope</p>
            </div>
            <p className="text-evo-accent text-xl font-bold">₪{lead.suggestedPrice?.toLocaleString()}</p>
          </div>
        </div>

        {/* Messages */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-4">EVO Channel</p>
          <div className="space-y-3 mb-4">
            {msgs.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.from === 'supplier' ? 'flex-row-reverse' : ''}`}>
                {m.from === 'evo' && (
                  <div className="w-7 h-7 rounded-full bg-evo-elevated border-[1.5px] border-evo-dim flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-evo-accent text-xs font-bold">E</span>
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${m.from === 'supplier' ? 'bg-evo-purple-mid text-white' : 'bg-white border-[1.5px] border-evo-border text-evo-text'}`}
                  style={m.from !== 'supplier' ? { boxShadow: 'rgba(45,27,105,0.06) 0px 2px 8px' } : {}}>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <p className={`text-[10px] mt-1.5 ${m.from === 'supplier' ? 'text-white/60' : 'text-evo-muted'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Ask EVO about this lead..."
              className="flex-1 bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-sm placeholder-evo-muted focus:outline-none focus:border-evo-purple-mid transition-colors" />
            <button onClick={sendMsg}
              className="w-10 h-10 rounded-xl bg-evo-purple-mid flex items-center justify-center hover:bg-evo-purple transition-all active:scale-95"
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
            <button onClick={() => { declineLead(lead.id); navigate('home') }}
              className="flex-1 py-3.5 rounded-[14px] border-2 border-evo-border text-evo-muted text-sm font-semibold hover:border-evo-dim hover:text-evo-text transition-all flex items-center justify-center gap-2">
              <X size={15} />
              Decline
            </button>
            <button onClick={() => { acceptLead(lead.id); navigate('home') }}
              className="flex-[2] py-3.5 rounded-[14px] bg-evo-purple-mid text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-evo-purple transition-all active:scale-[0.98]"
              style={{ boxShadow: 'rgba(45,27,105,0.35) 0px 4px 16px' }}>
              <Check size={15} />
              Accept Lead
            </button>
          </div>
        </div>
      )}

      {isBooked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-evo-border px-6 py-4 z-30">
          <button onClick={() => goTab('events')}
            className="w-full py-4 rounded-[14px] border-2 border-evo-purple-mid text-evo-purple-mid text-sm font-semibold tracking-wider uppercase hover:bg-evo-purple-mid hover:text-white transition-all">
            View in Events
          </button>
        </div>
      )}
    </div>
  )
}
