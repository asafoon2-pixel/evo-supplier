import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Zap } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

const STEPS = ['category', 'details', 'package', 'analysis', 'softlock', 'dashboard']

const CATEGORIES = [
  { icon: '🔊', name: 'Sound',         desc: 'PA systems, speakers, DJ gear' },
  { icon: '💡', name: 'Lighting',      desc: 'Stage, ambient, LED setups' },
  { icon: '🌸', name: 'Decor',         desc: 'Florals, styling, props' },
  { icon: '🍹', name: 'Bar',           desc: 'Mobile bars, alcohol, staff' },
  { icon: '📸', name: 'Photography',   desc: 'Photo & video coverage' },
  { icon: '🎤', name: 'Entertainment', desc: 'DJ, live acts, performers' },
]

const ADDONS = ['Setup included', 'Staff included', 'Delivery included', 'Custom setup available']

function ScreenHeader({ onBack, step }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 shrink-0">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-evo-elevated"
      >
        <ArrowLeft size={18} className="text-evo-text" />
      </button>
      <div className="flex items-center gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 20 : 8,
              background: i === step ? '#2D1B8A' : i < step ? '#6C5CE7' : '#E8E8F0',
            }}
          />
        ))}
      </div>
      <div className="w-9" />
    </div>
  )
}

export default function Onboarding() {
  const { navigate, setSupplierName } = useSupplier()
  const [step, setStep] = useState(0)

  const [category,       setCategory]      = useState(null)
  const [bizName,        setBizName]        = useState('')
  const [contactName,    setContactName]    = useState('')
  const [phone,          setPhone]          = useState('')
  const [city,           setCity]           = useState('')
  const [pkgName,        setPkgName]        = useState('')
  const [pkgDesc,        setPkgDesc]        = useState('')
  const [pkgPrice,       setPkgPrice]       = useState('')
  const [pkgGuests,      setPkgGuests]      = useState('')
  const [selectedAddons, setSelectedAddons] = useState([])

  const canNext = () => {
    if (step === 0) return !!category
    if (step === 1) return bizName.length > 2 && city.length > 1
    if (step === 2) return pkgName.length > 0 && pkgPrice.length > 0
    return true
  }

  const toggleAddon = (a) =>
    setSelectedAddons(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const next = async () => {
    if (step < STEPS.length - 1) {
      if (step === STEPS.length - 2) {
        try {
          await addDoc(collection(db, 'suppliers'), {
            category,
            businessName: bizName,
            contactName,
            city,
            phone,
            package: { name: pkgName, description: pkgDesc, price: pkgPrice, maxGuests: pkgGuests, addons: selectedAddons },
            status: 'pending_review',
            dateAdded: new Date(),
          })
          setSupplierName(contactName || bizName)
        } catch (err) {
          console.error('Error saving supplier:', err)
        }
      }
      setStep(s => s + 1)
    } else {
      navigate('home')
    }
  }

  const back = () => (step === 0 ? navigate('entry') : setStep(s => s - 1))

  const catIcon = CATEGORIES.find(c => c.name === category)?.icon || '📦'

  const slide = {
    initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 }, transition: { duration: 0.22 },
  }

  const inputCls =
    'w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors'

  return (
    <div className="flex flex-col min-h-screen bg-evo-bg">
      <ScreenHeader onBack={back} step={step} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">

          {/* STEP 0 — Category */}
          {step === 0 && (
            <motion.div key="cat" {...slide} className="px-6 pb-6">
              <h2 className="text-[26px] font-extrabold text-evo-text mb-1" style={{ letterSpacing: '-0.5px' }}>
                What do you offer?
              </h2>
              <p className="text-sm font-semibold text-evo-muted mb-6">Choose your main service category</p>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <button key={cat.name} onClick={() => setCategory(cat.name)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] border-[1.5px] transition-all text-left ${
                      category === cat.name ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${category === cat.name ? 'text-evo-purple' : 'text-evo-text'}`}>
                        {cat.name}
                      </p>
                      <p className="text-xs text-evo-muted mt-0.5">{cat.desc}</p>
                    </div>
                    {category === cat.name && (
                      <div className="w-5 h-5 rounded-full bg-evo-purple-mid flex items-center justify-center shrink-0">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 1 — Business Details */}
          {step === 1 && (
            <motion.div key="details" {...slide} className="px-6 pb-6">
              <h2 className="text-[26px] font-extrabold text-evo-text mb-1" style={{ letterSpacing: '-0.5px' }}>
                Tell us about your business
              </h2>
              <p className="text-sm font-semibold text-evo-muted mb-6">We'll build your public EVO profile</p>
              <div className="space-y-4">
                {[
                  { label: 'Business name',     value: bizName,     set: setBizName,     ph: 'e.g. Studio Sound',   type: 'text' },
                  { label: 'Contact name',      value: contactName, set: setContactName, ph: 'e.g. Yael Cohen',     type: 'text' },
                  { label: 'Phone number',      value: phone,       set: setPhone,       ph: '+972 50 000 0000',    type: 'tel'  },
                  { label: 'City / Area served',value: city,        set: setCity,        ph: 'e.g. Tel Aviv',       type: 'text' },
                ].map(({ label, value, set, ph, type }) => (
                  <div key={label}>
                    <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">{label}</label>
                    <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} className={inputCls} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Package Builder */}
          {step === 2 && (
            <motion.div key="package" {...slide} className="px-6 pb-6">
              <h2 className="text-[26px] font-extrabold text-evo-text mb-1" style={{ letterSpacing: '-0.5px' }}>
                Create your first package
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <Zap size={13} className="text-evo-accent shrink-0" />
                <p className="text-sm font-bold text-evo-accent">Suppliers with packages get 3× more bookings</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Package name</label>
                  <input type="text" value={pkgName} onChange={e => setPkgName(e.target.value)}
                    placeholder="e.g. Full Sound Package" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Description</label>
                  <textarea value={pkgDesc} onChange={e => setPkgDesc(e.target.value)}
                    placeholder="Describe what's included…" rows={3} className={inputCls + ' resize-none'} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-evo-muted font-bold">₪</span>
                      <input type="number" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)}
                        placeholder="5,000" className={inputCls + ' pl-8'} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Max guests</label>
                    <input type="number" value={pkgGuests} onChange={e => setPkgGuests(e.target.value)}
                      placeholder="200" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">Add-ons included</label>
                  <div className="flex flex-wrap gap-2">
                    {ADDONS.map(a => (
                      <button key={a} onClick={() => toggleAddon(a)}
                        className={`px-4 py-2 border-[1.5px] text-sm font-bold transition-all ${
                          selectedAddons.includes(a) ? 'bg-evo-elevated border-evo-purple-mid text-evo-purple' : 'bg-white border-evo-border text-evo-muted'
                        }`}
                        style={{ borderRadius: 50 }}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — AI Profile Analysis */}
          {step === 3 && (
            <motion.div key="analysis" {...slide} className="px-6 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4"
                style={{ borderRadius: 50, background: '#EEF0FF', border: '1.5px solid #C5B8F0' }}>
                <span className="text-evo-accent font-extrabold text-sm">✦</span>
                <span className="text-xs font-bold text-evo-purple">Profile Analysis</span>
              </div>
              <h2 className="text-[26px] font-extrabold text-evo-text mb-1" style={{ letterSpacing: '-0.5px' }}>
                Your package is<br />ready to go live.
              </h2>
              <p className="text-sm font-semibold text-evo-muted mb-6">EVO analyzed your profile</p>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-evo-text">Profile Strength</p>
                  <p className="text-2xl font-extrabold text-evo-purple">78%</p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#EEF0FF' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: '78%' }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #2D1B8A, #6C5CE7)' }} />
                </div>
              </div>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5 space-y-4 mb-4">
                {[['Market Fit', 85], ['Price Competitiveness', 72], ['Package Completeness', 80], ['Photos Impact', 65]].map(([label, value], i) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-evo-muted">{label}</p>
                      <p className="text-xs font-extrabold text-evo-purple">{value}%</p>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EEF0FF' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-evo-accent" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {[`${category || 'Service'} specialist`, 'Competitive pricing', 'Quick response'].map(chip => (
                  <span key={chip} className="px-3 py-1.5 text-xs font-bold text-evo-purple bg-evo-elevated border-[1.5px] border-evo-dim"
                    style={{ borderRadius: 50 }}>
                    ✓ {chip}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Soft Lock */}
          {step === 4 && (
            <motion.div key="softlock" {...slide} className="px-6 pb-6">
              <div className="flex flex-col items-center text-center pt-4 pb-6">
                <div className="text-5xl mb-5">🎯</div>
                <h2 className="text-[26px] font-extrabold text-evo-text mb-2" style={{ letterSpacing: '-0.5px' }}>
                  Create your supplier<br />account to go live.
                </h2>
                <p className="text-sm font-semibold text-evo-muted">Your profile is ready — one step left</p>
              </div>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5 mb-4">
                {['Category selected', 'Business details added', 'Package created', 'Go live!'].map((label, i) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-evo-border last:border-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: i < 3 ? '#00C48C' : 'transparent', border: i < 3 ? 'none' : '2px solid #E8E8F0' }}>
                      {i < 3 ? <Check size={12} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-evo-border" />}
                    </div>
                    <p className={`text-sm font-bold flex-1 ${i < 3 ? 'text-evo-text' : 'text-evo-muted'}`}>{label}</p>
                    {i < 3 && <span className="text-[10px] font-extrabold text-evo-green bg-evo-green/10 px-2 py-0.5 rounded-full">Done</span>}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 py-3 px-5 mx-auto w-fit"
                style={{ borderRadius: 50, background: '#EEF0FF', border: '1.5px solid #C5B8F0' }}>
                <span className="font-extrabold text-evo-pink">+40%</span>
                <span className="text-sm font-bold text-evo-purple">more bookings with an active account</span>
              </div>
            </motion.div>
          )}

          {/* STEP 5 — Dashboard Preview */}
          {step === 5 && (
            <motion.div key="dashboard" {...slide} className="px-6 pb-6">
              <h2 className="text-[26px] font-extrabold text-evo-text mb-1" style={{ letterSpacing: '-0.5px' }}>
                Welcome to your<br />dashboard
              </h2>
              <p className="text-sm font-semibold text-evo-muted mb-6">You're all set. Here's what's waiting.</p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[{ label: 'Bookings', value: '0' }, { label: 'Reviews', value: '0' }, { label: 'Profile', value: 'Active' }].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-[16px] border-[1.5px] border-evo-border p-3 text-center">
                    <p className="text-xl font-extrabold text-evo-purple">{value}</p>
                    <p className="text-xs font-semibold text-evo-muted mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{catIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-evo-text truncate">{pkgName || 'Your Package'}</p>
                    <p className="text-xs text-evo-muted">{category || 'Category'}</p>
                  </div>
                  <p className="text-lg font-extrabold text-evo-purple shrink-0">
                    {pkgPrice ? `₪${Number(pkgPrice).toLocaleString()}` : '—'}
                  </p>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-evo-border">
                    {selectedAddons.map(a => (
                      <span key={a} className="text-[10px] font-bold px-2.5 py-1 bg-evo-elevated border-[1.5px] border-evo-dim text-evo-purple"
                        style={{ borderRadius: 50 }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-evo-muted mb-2 uppercase tracking-wider">Your profile link</p>
                <div className="flex items-center gap-2 bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3">
                  <span className="text-sm text-evo-accent font-bold flex-1 truncate">
                    evo.co.il/{(bizName || 'your-profile').toLowerCase().replace(/\s+/g, '-')}
                  </span>
                  <button
                    className="text-xs font-extrabold text-evo-purple-mid bg-evo-elevated px-3 py-1.5 rounded-lg"
                    onClick={() => navigator.clipboard?.writeText(`evo.co.il/${(bizName || 'your-profile').toLowerCase().replace(/\s+/g, '-')}`)}>
                    Copy
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* CTA pinned to bottom */}
      <div className="px-6 pb-6 pt-2 bg-evo-bg shrink-0">
        <button onClick={next} disabled={!canNext()}
          className="w-full py-4 text-white text-base font-extrabold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            borderRadius: 14,
            background: '#2D1B8A',
            boxShadow: canNext() ? '0 4px 20px rgba(45,27,105,0.35)' : 'none',
          }}>
          {step === 3 ? '✦ Activate My Profile'
           : step === 4 ? 'Sign Up / Sign In'
           : step === 5 ? 'Browse open events →'
           : 'Continue'}
        </button>
      </div>
    </div>
  )
}
