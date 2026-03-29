import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Zap, Plus, Minus, ChevronDown } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

// ─── CONSTANTS ────────────────────────────────────────────────
const STEPS = ['category','identity','contact','story','package','pricing','documents','analysis','softlock','dashboard']

const CATEGORIES = [
  { icon: '🔊', name: 'Sound',         desc: 'PA systems, speakers, DJ gear' },
  { icon: '💡', name: 'Lighting',      desc: 'Stage, ambient, LED setups' },
  { icon: '🌸', name: 'Decor',         desc: 'Florals, styling, props' },
  { icon: '🍹', name: 'Bar',           desc: 'Mobile bars, alcohol, staff' },
  { icon: '📸', name: 'Photography',   desc: 'Photo & video coverage' },
  { icon: '🎤', name: 'Entertainment', desc: 'DJ, live acts, performers' },
  { icon: '🍽️', name: 'Catering',      desc: 'Food, waitstaff, equipment' },
  { icon: '🚌', name: 'Transport',     desc: 'Guest shuttle, limo, vans' },
]

const EXPERIENCE_OPTIONS = [
  { value: 1,   label: 'Less than a year', icon: '🌱' },
  { value: 2,   label: '1–3 years',        icon: '🌿' },
  { value: 5,   label: '3–7 years',        icon: '🌳' },
  { value: 10,  label: '7+ years',         icon: '🏆' },
]

const TEAM_OPTIONS = [
  { value: 1,  label: 'Just me',  icon: '🙋' },
  { value: 3,  label: '2–5',      icon: '🤝' },
  { value: 10, label: '5–15',     icon: '🏢' },
  { value: 20, label: '15+',      icon: '🏭' },
]

const CONTACT_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'call',     label: 'Call',     icon: '📞' },
  { value: 'email',    label: 'Email',    icon: '✉️' },
]

const CITIES = ['Tel Aviv','Jerusalem','Haifa','Rishon LeZion','Petah Tikva','Ashdod','Netanya','Beer Sheva','Herzliya','Ramat Gan','Other']

const PRICE_TYPES = [
  { value: 'fixed',     label: 'Fixed price',  icon: '📦', desc: 'One total price' },
  { value: 'per_hour',  label: 'Per hour',     icon: '⏱',  desc: 'Hourly rate' },
  { value: 'per_guest', label: 'Per guest',    icon: '👥', desc: 'Per head' },
]

const PRICING_RULES = [
  { type: 'weekend_surcharge', label: 'Weekend rate',     icon: '🌙', desc: 'Higher price Fri–Sat' },
  { type: 'holiday',           label: 'Holiday rate',     icon: '🎊', desc: 'Holidays & special dates' },
  { type: 'early_bird',        label: 'Early bird',       icon: '🚀', desc: 'Discount for advance booking' },
  { type: 'last_minute',       label: 'Last-minute deal', icon: '⚡', desc: 'Discount within 2 weeks' },
]

const BIO_HINTS = {
  Sound:         ['Professional sound system for any venue size', 'Crystal-clear audio that fills every corner', 'From intimate dinners to 500-guest weddings'],
  Lighting:      ['Transforming spaces with atmospheric lighting', 'LED and stage lighting for every mood', 'Custom lighting design for your event'],
  Decor:         ['Bringing your floral vision to life', 'Organic textures, flowing greenery, warm tones', 'Every arrangement crafted from scratch'],
  Bar:           ['Premium mobile bar for any event', 'Craft cocktails and personalized menus', 'Full bar setup including staff and equipment'],
  Photography:   ['Capturing your most important moments', 'Documentary-style coverage, natural and real', 'High-end editing delivered within 2 weeks'],
  Entertainment: ['Keeping the energy high all night', 'Reading the room and playing the right music', 'Professional DJ with 10+ years of experience'],
  Catering:      ['Fresh seasonal menus tailored to your guests', 'Full service from setup to cleanup', 'Dietary options for every requirement'],
  Transport:     ['Luxury transport for your guests', 'On-time, professional drivers', 'Fleet of vehicles for any group size'],
}

// ─── HELPER COMPONENTS ────────────────────────────────────────

function ProgressBar({ step, total }) {
  const pct = ((step + 1) / total) * 100
  return (
    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#E8E8F0' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #2D1B8A, #6C5CE7)' }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}

function Header({ onBack, step }) {
  return (
    <div className="px-6 pt-4 pb-3 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-evo-elevated">
          <ArrowLeft size={18} className="text-evo-text" />
        </button>
        <span className="text-xs font-bold text-evo-muted">{step + 1} / {STEPS.length}</span>
        <div className="w-9" />
      </div>
      <ProgressBar step={step} total={STEPS.length} />
    </div>
  )
}

function Chip({ selected, onClick, children, className = '' }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 border-[1.5px] text-sm font-bold transition-all ${
        selected ? 'bg-evo-elevated border-evo-purple-mid text-evo-purple' : 'bg-white border-evo-border text-evo-muted'
      } ${className}`}
      style={{ borderRadius: 50 }}>
      {children}
    </button>
  )
}

function StepTitle({ title, sub }) {
  return (
    <div className="mb-6">
      <h2 className="text-[24px] font-extrabold text-evo-text leading-tight" style={{ letterSpacing: '-0.5px' }}>{title}</h2>
      {sub && <p className="text-sm font-semibold text-evo-muted mt-1">{sub}</p>}
    </div>
  )
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">{label}</label>
      <input
        className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors"
        {...props}
      />
    </div>
  )
}

function Stepper({ value, onChange, min = 0, max = 999, label }) {
  return (
    <div>
      {label && <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">{label}</label>}
      <div className="flex items-center gap-4 bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3">
        <button onClick={() => onChange(Math.max(min, (parseInt(value) || 0) - 1))}
          className="w-7 h-7 rounded-full bg-evo-elevated flex items-center justify-center shrink-0">
          <Minus size={12} className="text-evo-purple" />
        </button>
        <span className="flex-1 text-center text-evo-text font-extrabold text-lg">{value || 0}</span>
        <button onClick={() => onChange(Math.min(max, (parseInt(value) || 0) + 1))}
          className="w-7 h-7 rounded-full bg-evo-elevated flex items-center justify-center shrink-0">
          <Plus size={12} className="text-evo-purple" />
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────
export default function Onboarding() {
  const { navigate, setSupplierName } = useSupplier()
  const [step, setStep] = useState(0)

  // Step 0: Category
  const [category, setCategory] = useState(null)

  // Step 1: Identity
  const [bizName,    setBizName]    = useState('')
  const [ownerName,  setOwnerName]  = useState('')
  const [experience, setExperience] = useState(null)
  const [teamSize,   setTeamSize]   = useState(null)

  // Step 2: Contact & Location
  const [phone,          setPhone]          = useState('')
  const [sameWhatsApp,   setSameWhatsApp]   = useState(true)
  const [whatsapp,       setWhatsApp]       = useState('')
  const [preferredContact, setPreferredContact] = useState('whatsapp')
  const [city,           setCity]           = useState('')
  const [customCity,     setCustomCity]     = useState('')
  const [address,        setAddress]        = useState('')

  // Step 3: Story
  const [bio,       setBio]       = useState('')
  const [instagram, setInstagram] = useState('')
  const [website,   setWebsite]   = useState('')

  // Step 4: Package
  const [pkgName,       setPkgName]       = useState('')
  const [pkgDesc,       setPkgDesc]       = useState('')
  const [pkgPrice,      setPkgPrice]      = useState('')
  const [pkgPriceType,  setPkgPriceType]  = useState('fixed')
  const [pkgMinGuests,  setPkgMinGuests]  = useState(50)
  const [pkgMaxGuests,  setPkgMaxGuests]  = useState(200)
  const [pkgMinHours,   setPkgMinHours]   = useState(3)

  // Step 5: Pricing rules
  const [pricingRules, setPricingRules] = useState({})

  // Step 6: Documents
  const [hasInsurance,  setHasInsurance]  = useState(null)
  const [hasLicense,    setHasLicense]    = useState(null)

  const catIcon = CATEGORIES.find(c => c.name === category)?.icon || '📦'
  const finalCity = city === 'Other' ? customCity : city

  const canNext = () => {
    if (step === 0) return !!category
    if (step === 1) return bizName.length > 1 && !!experience && !!teamSize
    if (step === 2) return phone.length > 7 && !!city
    if (step === 3) return bio.length > 20
    if (step === 4) return pkgName.length > 0 && pkgPrice > 0
    return true
  }

  const togglePricingRule = (type) => {
    setPricingRules(prev => {
      const copy = { ...prev }
      if (copy[type]) delete copy[type]
      else copy[type] = { adjustType: 'percent', value: '' }
      return copy
    })
  }

  const updatePricingRule = (type, field, val) => {
    setPricingRules(prev => ({ ...prev, [type]: { ...prev[type], [field]: val } }))
  }

  const appendBio = (hint) => setBio(prev => prev ? prev + ' ' + hint : hint)

  const next = async () => {
    if (step < STEPS.length - 1) {
      if (step === STEPS.length - 3) { // before softlock — save to Firestore
        try {
          await addDoc(collection(db, 'suppliers'), {
            business_name:     bizName,
            owner_full_name:   ownerName,
            category,
            city:              finalCity,
            full_address:      address,
            bio,
            years_experience:  experience,
            employee_count:    teamSize,
            phone,
            whatsapp_number:   sameWhatsApp ? phone : whatsapp,
            preferred_contact: preferredContact,
            instagram_handle:  instagram,
            website_url:       website,
            is_approved:       false,
            is_active:         false,
            verification_status: 'pending',
            package: {
              name:        pkgName,
              description: pkgDesc,
              price:       parseFloat(pkgPrice),
              price_type:  pkgPriceType,
              min_guests:  pkgMinGuests,
              max_guests:  pkgMaxGuests,
              min_hours:   pkgMinHours,
            },
            pricing_rules: Object.entries(pricingRules).map(([type, r]) => ({
              rule_type:        type,
              adjustment_type:  r.adjustType,
              adjustment_value: parseFloat(r.value) || 0,
            })),
            documents: {
              has_insurance:       hasInsurance === true,
              has_business_license: hasLicense === true,
            },
            created_at: new Date(),
          })
          setSupplierName(ownerName || bizName)
        } catch (err) {
          console.error('Firestore save error:', err)
        }
      }
      setStep(s => s + 1)
    } else {
      navigate('home')
    }
  }

  const back = () => step === 0 ? navigate('entry') : setStep(s => s - 1)

  const slide = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.22 } }

  return (
    <div className="flex flex-col min-h-screen bg-evo-bg">
      <Header onBack={back} step={step} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">

          {/* ── 0: Category ── */}
          {step === 0 && (
            <motion.div key="cat" {...slide} className="px-6 pb-6">
              <StepTitle title="What do you offer?" sub="Choose your main service category" />
              <div className="space-y-2.5">
                {CATEGORIES.map(cat => (
                  <button key={cat.name} onClick={() => setCategory(cat.name)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[20px] border-[1.5px] transition-all text-left ${
                      category === cat.name ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                    }`}>
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${category === cat.name ? 'text-evo-purple' : 'text-evo-text'}`}>{cat.name}</p>
                      <p className="text-xs text-evo-muted mt-0.5 font-medium">{cat.desc}</p>
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

          {/* ── 1: Business Identity ── */}
          {step === 1 && (
            <motion.div key="identity" {...slide} className="px-6 pb-6 space-y-5">
              <StepTitle title={`Introduce your ${category} business`} sub="Tell EVO who you are" />

              <InputField label="Business name" value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Studio Sound Pro" />
              <InputField label="Your name" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g. Yael Cohen" />

              <div>
                <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">How long have you been doing this?</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setExperience(opt.value)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-[16px] border-[1.5px] transition-all text-left ${
                        experience === opt.value ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                      }`}>
                      <span className="text-xl">{opt.icon}</span>
                      <span className={`text-sm font-bold ${experience === opt.value ? 'text-evo-purple' : 'text-evo-text'}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">Team size</label>
                <div className="grid grid-cols-4 gap-2">
                  {TEAM_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setTeamSize(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-[16px] border-[1.5px] transition-all ${
                        teamSize === opt.value ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                      }`}>
                      <span className="text-xl">{opt.icon}</span>
                      <span className={`text-[11px] font-bold ${teamSize === opt.value ? 'text-evo-purple' : 'text-evo-muted'}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 2: Contact & Location ── */}
          {step === 2 && (
            <motion.div key="contact" {...slide} className="px-6 pb-6 space-y-5">
              <StepTitle title="How to reach you" sub="Clients contact you through EVO" />

              <InputField label="Phone number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+972 50 000 0000" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-evo-muted uppercase tracking-wider">WhatsApp</label>
                  <button onClick={() => setSameWhatsApp(p => !p)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border-[1.5px] transition-all ${
                      sameWhatsApp ? 'bg-evo-elevated border-evo-purple-mid text-evo-purple' : 'border-evo-border text-evo-muted'
                    }`}>
                    <div className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center ${sameWhatsApp ? 'bg-evo-purple-mid' : 'border border-evo-muted'}`}>
                      {sameWhatsApp && <Check size={9} className="text-white" />}
                    </div>
                    Same as phone
                  </button>
                </div>
                {!sameWhatsApp && (
                  <input type="tel" value={whatsapp} onChange={e => setWhatsApp(e.target.value)} placeholder="+972 50 000 0000"
                    className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors" />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">Preferred contact</label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTACT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setPreferredContact(opt.value)}
                      className={`flex flex-col items-center gap-2 py-3 rounded-[16px] border-[1.5px] transition-all ${
                        preferredContact === opt.value ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                      }`}>
                      <span className="text-2xl">{opt.icon}</span>
                      <span className={`text-xs font-bold ${preferredContact === opt.value ? 'text-evo-purple' : 'text-evo-muted'}`}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">Your city</label>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(c => (
                    <Chip key={c} selected={city === c} onClick={() => setCity(c)}>{c}</Chip>
                  ))}
                </div>
                {city === 'Other' && (
                  <input type="text" value={customCity} onChange={e => setCustomCity(e.target.value)} placeholder="Type your city"
                    className="mt-3 w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors" />
                )}
              </div>
            </motion.div>
          )}

          {/* ── 3: Your Story ── */}
          {step === 3 && (
            <motion.div key="story" {...slide} className="px-6 pb-6 space-y-5">
              <StepTitle title="Tell your story" sub="This shows on your EVO profile" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-evo-muted uppercase tracking-wider">About your business</label>
                  <span className={`text-xs font-bold ${bio.length > 20 ? 'text-evo-green' : 'text-evo-muted'}`}>{bio.length} / 300</span>
                </div>
                <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 300))} rows={4} placeholder="Describe what makes you stand out…"
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors resize-none" />

                {/* Smart suggestions */}
                {bio.length < 50 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-evo-muted uppercase tracking-wider mb-2">✦ Tap to add</p>
                    <div className="flex flex-wrap gap-2">
                      {(BIO_HINTS[category] || BIO_HINTS.Sound).map(hint => (
                        <button key={hint} onClick={() => appendBio(hint)}
                          className="text-xs font-semibold px-3 py-1.5 bg-evo-elevated border-[1.5px] border-evo-dim text-evo-purple rounded-full text-left">
                          + {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Instagram</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-evo-muted font-bold">@</span>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value.replace('@', ''))} placeholder="yourbusiness"
                    className="w-full bg-white border-[1.5px] border-evo-border rounded-xl pl-8 pr-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-evo-muted uppercase tracking-wider">Website</label>
                  <span className="text-[10px] font-bold text-evo-muted bg-evo-elevated px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourbusiness.com"
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors" />
              </div>
            </motion.div>
          )}

          {/* ── 4: Package Builder ── */}
          {step === 4 && (
            <motion.div key="package" {...slide} className="px-6 pb-6 space-y-5">
              <StepTitle
                title="Build your first package"
                sub={<span className="flex items-center gap-1.5"><Zap size={13} className="text-evo-accent" /><span className="text-evo-accent font-bold">Suppliers with packages get 3× more bookings</span></span>}
              />

              <InputField label="Package name" value={pkgName} onChange={e => setPkgName(e.target.value)} placeholder="e.g. Full Day Sound Package" />

              <div>
                <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">Pricing model</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_TYPES.map(pt => (
                    <button key={pt.value} onClick={() => setPkgPriceType(pt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-[16px] border-[1.5px] transition-all ${
                        pkgPriceType === pt.value ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                      }`}>
                      <span className="text-xl">{pt.icon}</span>
                      <span className={`text-[11px] font-bold text-center ${pkgPriceType === pt.value ? 'text-evo-purple' : 'text-evo-text'}`}>{pt.label}</span>
                      <span className="text-[10px] text-evo-muted font-medium">{pt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
                  Price {pkgPriceType === 'per_hour' ? '(per hour)' : pkgPriceType === 'per_guest' ? '(per person)' : ''}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-evo-muted font-bold">₪</span>
                  <input type="number" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)} placeholder="0"
                    className="w-full bg-white border-[1.5px] border-evo-border rounded-xl pl-8 pr-4 py-3.5 text-evo-text text-[15px] focus:outline-none focus:border-evo-purple-mid transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Stepper label="Min guests" value={pkgMinGuests} onChange={setPkgMinGuests} min={0} />
                <Stepper label="Max guests" value={pkgMaxGuests} onChange={setPkgMaxGuests} min={0} />
                <Stepper label="Min hours" value={pkgMinHours}  onChange={setPkgMinHours}  min={1} max={24} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-evo-muted uppercase tracking-wider">Description</label>
                  <span className="text-[10px] font-bold text-evo-muted bg-evo-elevated px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <textarea value={pkgDesc} onChange={e => setPkgDesc(e.target.value)} rows={3} placeholder="What's included in this package?"
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors resize-none" />
              </div>
            </motion.div>
          )}

          {/* ── 5: Pricing Rules ── */}
          {step === 5 && (
            <motion.div key="pricing" {...slide} className="px-6 pb-6">
              <StepTitle title="Any special pricing?" sub="EVO shows these automatically to clients" />

              <div className="space-y-3 mb-5">
                {PRICING_RULES.map(rule => {
                  const active = !!pricingRules[rule.type]
                  return (
                    <div key={rule.type}>
                      <button onClick={() => togglePricingRule(rule.type)}
                        className={`w-full flex items-center gap-4 p-4 rounded-[20px] border-[1.5px] transition-all text-left ${
                          active ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                        }`}>
                        <span className="text-2xl">{rule.icon}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${active ? 'text-evo-purple' : 'text-evo-text'}`}>{rule.label}</p>
                          <p className="text-xs text-evo-muted mt-0.5 font-medium">{rule.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                          active ? 'bg-evo-purple-mid border-evo-purple-mid' : 'border-evo-border'
                        }`}>
                          {active && <Check size={11} className="text-white" />}
                        </div>
                      </button>

                      {/* Expanded rule editor */}
                      {active && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                          className="mx-2 mt-1 bg-evo-elevated rounded-b-[16px] px-4 py-3 border-[1.5px] border-t-0 border-evo-purple-mid">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {[['percent', '%'], ['fixed', '₪']].map(([val, sym]) => (
                                <button key={val} onClick={() => updatePricingRule(rule.type, 'adjustType', val)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold border-[1.5px] transition-all ${
                                    pricingRules[rule.type]?.adjustType === val
                                      ? 'bg-evo-purple-mid text-white border-evo-purple-mid'
                                      : 'bg-white text-evo-muted border-evo-border'
                                  }`}>
                                  {sym}
                                </button>
                              ))}
                            </div>
                            <input type="number" value={pricingRules[rule.type]?.value || ''}
                              onChange={e => updatePricingRule(rule.type, 'value', e.target.value)}
                              placeholder={pricingRules[rule.type]?.adjustType === 'percent' ? '10' : '500'}
                              className="flex-1 bg-white border-[1.5px] border-evo-border rounded-xl px-3 py-2 text-evo-text text-sm font-bold focus:outline-none focus:border-evo-purple-mid transition-colors" />
                            <span className="text-xs font-bold text-evo-muted">
                              {pricingRules[rule.type]?.adjustType === 'percent' ? '% change' : '₪ change'}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-[16px] border-[1.5px] border-evo-border">
                <span className="text-2xl">💡</span>
                <p className="text-xs text-evo-muted font-semibold leading-relaxed">
                  You can skip this and add pricing rules anytime from your dashboard.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── 6: Documents ── */}
          {step === 6 && (
            <motion.div key="documents" {...slide} className="px-6 pb-6">
              <StepTitle title="Official documents" sub="Verified suppliers get 60% more leads" />

              <div className="space-y-3 mb-6">
                {[
                  { key: 'insurance', state: hasInsurance, setState: setHasInsurance, icon: '🛡️', title: 'Business Insurance', desc: 'Liability coverage certificate' },
                  { key: 'license',   state: hasLicense,   setState: setHasLicense,   icon: '📋', title: 'Business License',   desc: 'Osek murshe / Company registration' },
                ].map(doc => (
                  <div key={doc.key} className={`bg-white rounded-[20px] border-[1.5px] p-4 transition-all ${
                    doc.state === true ? 'border-evo-green' : doc.state === false ? 'border-evo-border' : 'border-evo-border'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-evo-text">{doc.title}</p>
                        <p className="text-xs text-evo-muted font-medium">{doc.desc}</p>
                      </div>
                      {doc.state === true && (
                        <div className="w-6 h-6 rounded-full bg-evo-green flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => doc.setState(true)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border-[1.5px] transition-all ${
                          doc.state === true ? 'bg-evo-green/10 border-evo-green text-evo-green' : 'border-evo-border text-evo-muted'
                        }`}>
                        ✓ I have it
                      </button>
                      <button onClick={() => doc.setState(false)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border-[1.5px] transition-all ${
                          doc.state === false ? 'bg-evo-elevated border-evo-purple-mid text-evo-purple' : 'border-evo-border text-evo-muted'
                        }`}>
                        Not yet
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-xs text-evo-muted font-semibold">Documents can be uploaded later from your Profile settings.</p>
              </div>
            </motion.div>
          )}

          {/* ── 7: AI Analysis ── */}
          {step === 7 && (
            <motion.div key="analysis" {...slide} className="px-6 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4"
                style={{ borderRadius: 50, background: '#EEF0FF', border: '1.5px solid #C5B8F0' }}>
                <span className="text-evo-accent font-extrabold text-sm">✦</span>
                <span className="text-xs font-bold text-evo-purple">Profile Analysis</span>
              </div>
              <h2 className="text-[24px] font-extrabold text-evo-text mb-1" style={{ letterSpacing: '-0.5px' }}>
                Your profile is<br />ready to go live.
              </h2>
              <p className="text-sm font-semibold text-evo-muted mb-6">EVO analyzed your profile completeness</p>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-evo-text">Profile Strength</p>
                  <p className="text-2xl font-extrabold text-evo-purple">
                    {Math.min(100, 40 + (bio.length > 50 ? 10 : 0) + (instagram ? 5 : 0) + (pkgName ? 15 : 0) + (Object.keys(pricingRules).length > 0 ? 10 : 0) + (hasInsurance ? 10 : 0) + (hasLicense ? 10 : 0))}%
                  </p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#EEF0FF' }}>
                  <motion.div initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, 40 + (bio.length > 50 ? 10 : 0) + (instagram ? 5 : 0) + (pkgName ? 15 : 0) + (Object.keys(pricingRules).length > 0 ? 10 : 0) + (hasInsurance ? 10 : 0) + (hasLicense ? 10 : 0))}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #2D1B8A, #6C5CE7)' }} />
                </div>
              </div>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5 space-y-4 mb-4">
                {[
                  { label: 'Category & Identity',  value: 95 },
                  { label: 'Contact Info',          value: phone ? 100 : 40 },
                  { label: 'Package Ready',         value: pkgName && pkgPrice ? 100 : 30 },
                  { label: 'Story & Social',        value: bio.length > 50 ? 90 : 40 },
                  { label: 'Documents',             value: (hasInsurance && hasLicense) ? 100 : hasInsurance || hasLicense ? 60 : 20 },
                ].map(({ label, value }, i) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-bold text-evo-muted">{label}</p>
                      <p className="text-xs font-extrabold text-evo-purple">{value}%</p>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EEF0FF' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${value === 100 ? 'bg-evo-green' : 'bg-evo-accent'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  `${category} specialist`,
                  experience >= 7 ? '7+ years experience' : experience >= 3 ? '3+ years experience' : 'Growing talent',
                  teamSize > 5 ? 'Full team' : teamSize > 1 ? 'Small team' : 'Solo artist',
                ].map(chip => (
                  <span key={chip} className="px-3 py-1.5 text-xs font-bold text-evo-purple bg-evo-elevated border-[1.5px] border-evo-dim"
                    style={{ borderRadius: 50 }}>✓ {chip}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 8: Soft Lock ── */}
          {step === 8 && (
            <motion.div key="softlock" {...slide} className="px-6 pb-6">
              <div className="flex flex-col items-center text-center pt-4 pb-6">
                <div className="text-5xl mb-5">🎯</div>
                <h2 className="text-[24px] font-extrabold text-evo-text mb-2" style={{ letterSpacing: '-0.5px' }}>
                  Create your supplier<br />account to go live.
                </h2>
                <p className="text-sm font-semibold text-evo-muted">Your profile is ready — one step left</p>
              </div>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5 mb-4">
                {['Category selected', 'Identity & story', 'Package created', 'Pricing rules set', 'Go live!'].map((label, i) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-evo-border last:border-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: i < 4 ? '#00C48C' : 'transparent', border: i < 4 ? 'none' : '2px solid #E8E8F0' }}>
                      {i < 4 ? <Check size={12} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-evo-border" />}
                    </div>
                    <p className={`text-sm font-bold flex-1 ${i < 4 ? 'text-evo-text' : 'text-evo-muted'}`}>{label}</p>
                    {i < 4 && <span className="text-[10px] font-extrabold text-evo-green bg-evo-green/10 px-2 py-0.5 rounded-full">Done</span>}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 py-3 px-5 mx-auto w-fit"
                style={{ borderRadius: 50, background: '#EEF0FF', border: '1.5px solid #C5B8F0' }}>
                <span className="font-extrabold text-evo-pink">+40%</span>
                <span className="text-sm font-bold text-evo-purple">more bookings with a verified account</span>
              </div>
            </motion.div>
          )}

          {/* ── 9: Dashboard Preview ── */}
          {step === 9 && (
            <motion.div key="dashboard" {...slide} className="px-6 pb-6">
              <h2 className="text-[24px] font-extrabold text-evo-text mb-1" style={{ letterSpacing: '-0.5px' }}>
                Welcome, {ownerName || bizName}! 🎉
              </h2>
              <p className="text-sm font-semibold text-evo-muted mb-6">Your EVO supplier profile is live.</p>

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
                    <p className="text-xs text-evo-muted font-medium">{category} · {pkgPriceType === 'per_hour' ? 'Per hour' : pkgPriceType === 'per_guest' ? 'Per guest' : 'Fixed'}</p>
                  </div>
                  <p className="text-lg font-extrabold text-evo-purple shrink-0">
                    {pkgPrice ? `₪${Number(pkgPrice).toLocaleString()}` : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-evo-muted font-medium pt-2 border-t border-evo-border">
                  <span>👥 {pkgMinGuests}–{pkgMaxGuests} guests</span>
                  <span>·</span>
                  <span>⏱ min {pkgMinHours}h</span>
                  {Object.keys(pricingRules).length > 0 && <><span>·</span><span>💸 {Object.keys(pricingRules).length} pricing rules</span></>}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-evo-muted mb-2 uppercase tracking-wider">Your profile link</p>
                <div className="flex items-center gap-2 bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3">
                  <span className="text-sm text-evo-accent font-bold flex-1 truncate">
                    evo.co.il/{(bizName || 'your-profile').toLowerCase().replace(/\s+/g, '-')}
                  </span>
                  <button className="text-xs font-extrabold text-evo-purple-mid bg-evo-elevated px-3 py-1.5 rounded-lg"
                    onClick={() => navigator.clipboard?.writeText(`evo.co.il/${(bizName || 'your-profile').toLowerCase().replace(/\s+/g, '-')}`)}>
                    Copy
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 pt-2 bg-evo-bg shrink-0">
        <button onClick={next} disabled={!canNext()}
          className="w-full py-4 text-white text-base font-extrabold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            borderRadius: 14,
            background: '#2D1B8A',
            boxShadow: canNext() ? '0 4px 20px rgba(45,27,105,0.35)' : 'none',
          }}>
          {step === 5 ? (Object.keys(pricingRules).length > 0 ? 'Save & Continue' : 'Skip for now') :
           step === 6 ? (hasInsurance !== null || hasLicense !== null ? 'Continue' : 'Skip for now') :
           step === 7 ? '✦ Activate My Profile' :
           step === 8 ? 'Sign Up / Sign In' :
           step === 9 ? 'Go to dashboard →' :
           'Continue'}
        </button>
      </div>
    </div>
  )
}
