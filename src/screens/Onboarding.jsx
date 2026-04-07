import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Zap, Plus, Minus, ChevronDown, Camera, X, Image } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

// ─── CONSTANTS ────────────────────────────────────────────────
const STEPS = ['category','identity','contact','story','package','products','pricing','documents','analysis','softlock','dashboard']

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

const PKG_BADGES = [
  { value: 'most_popular',    label: '⭐ Most Popular' },
  { value: 'best_value',      label: '💰 Best Value' },
  { value: 'evo_recommended', label: '✦ EVO Recommended' },
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

// ─── PACKAGE TEMPLATES ────────────────────────────────────────
const PACKAGE_TEMPLATES = {
  Sound: {
    types: ['Small Event (up to 150 guests)', 'Medium Event (150–300 guests)', 'Large Event (300–600 guests)', 'Premium / Festival (600+)'],
    fields: [
      { key: 'speakers',    label: 'Speakers',      type: 'text',   ph: 'e.g. 2× JBL SRX815' },
      { key: 'subwoofers',  label: 'Subwoofers',    type: 'text',   ph: 'e.g. 1× JBL SRX818', optional: true },
      { key: 'mixer',       label: 'Mixer / Console', type: 'text', ph: 'e.g. Pioneer DJM-900' },
      { key: 'microphones', label: 'Microphones',   type: 'number', ph: '2' },
      { key: 'dj_connection', label: 'DJ Connection included', type: 'toggle' },
      { key: 'technician',  label: 'Technician',    type: 'select', options: ['None', 'Setup only', 'Full event'] },
    ],
  },
  Lighting: {
    types: ['Basic Lighting', 'Party Lighting', 'Club Setup', 'Premium Production'],
    fields: [
      { key: 'par_lights',   label: 'PAR Lights',     type: 'number', ph: '8' },
      { key: 'moving_heads', label: 'Moving Heads',   type: 'number', ph: '4' },
      { key: 'led_strips',   label: 'LED Strips',     type: 'text',   ph: 'e.g. 10m RGB strips', optional: true },
      { key: 'fog_machine',  label: 'Fog Machine',    type: 'toggle' },
      { key: 'laser',        label: 'Laser Show',     type: 'toggle', optional: true },
      { key: 'operator',     label: 'Lighting Operator', type: 'select', options: ['None', 'Setup only', 'Full event'] },
    ],
  },
  Decor: {
    types: ['Basic Setup', 'Styled Event', 'Premium Design', 'Instagram Experience'],
    fields: [
      { key: 'floral',       label: 'Floral Arrangements', type: 'text',   ph: 'e.g. 10 table centerpieces' },
      { key: 'centerpieces', label: 'Centerpieces',        type: 'number', ph: '10' },
      { key: 'backdrop',     label: 'Backdrop included',   type: 'toggle' },
      { key: 'color_scheme', label: 'Signature Color Scheme', type: 'text', ph: 'e.g. White & gold' },
      { key: 'props',        label: 'Props & Accessories', type: 'text',   ph: 'e.g. Candles, lanterns', optional: true },
      { key: 'setup_crew',   label: 'Setup Crew (people)', type: 'number', ph: '2' },
    ],
  },
  Bar: {
    types: ['Basic Bar', 'Classic Bar', 'Premium Bar', 'Open Bar Luxury'],
    fields: [
      { key: 'bartenders',       label: 'Bartenders',              type: 'number', ph: '2' },
      { key: 'bar_equipment',    label: 'Bar Equipment',           type: 'text',   ph: 'e.g. Full mobile bar, ice machine' },
      { key: 'alcohol_included', label: 'Alcohol included in price', type: 'toggle' },
      { key: 'cocktail_menu',    label: 'Cocktail Menu',           type: 'text',   ph: 'e.g. 8 signature cocktails' },
      { key: 'non_alcoholic',    label: 'Non-alcoholic options',   type: 'toggle' },
      { key: 'hours_service',    label: 'Hours of Service',        type: 'number', ph: '5' },
    ],
  },
  Photography: {
    types: ['Basic Coverage', 'Standard Event', 'Premium Coverage', 'Full Production'],
    fields: [
      { key: 'photographers',  label: 'Photographers',          type: 'number', ph: '1' },
      { key: 'videographers',  label: 'Videographers',          type: 'number', ph: '1', optional: true },
      { key: 'hours_coverage', label: 'Hours of Coverage',      type: 'number', ph: '6' },
      { key: 'editing_days',   label: 'Editing & Delivery (days)', type: 'number', ph: '14' },
      { key: 'drone',          label: 'Drone footage',          type: 'toggle', optional: true },
      { key: 'photo_booth',    label: 'Photo booth',            type: 'toggle', optional: true },
    ],
  },
  Entertainment: {
    types: ['Basic Performer', 'Pro Performer', 'Headliner', 'Full Experience'],
    fields: [
      { key: 'performers',        label: 'Number of Performers',  type: 'number', ph: '1' },
      { key: 'performance_type',  label: 'Type of Performance',   type: 'text',   ph: 'e.g. DJ set, Live band, MC' },
      { key: 'set_duration',      label: 'Set Duration (hours)',  type: 'number', ph: '3' },
      { key: 'equipment',         label: 'Equipment included',    type: 'toggle' },
      { key: 'sound_system',      label: 'Sound system included', type: 'toggle', optional: true },
      { key: 'lighting_show',     label: 'Lighting show',         type: 'toggle', optional: true },
    ],
  },
  Catering: {
    types: ['Finger Food', 'Buffet', 'Premium Catering', 'Live Stations'],
    fields: [
      { key: 'dishes_count',   label: 'Number of Dishes',       type: 'number', ph: '12' },
      { key: 'waitstaff',      label: 'Waitstaff Included',     type: 'number', ph: '3' },
      { key: 'dietary',        label: 'Dietary Options',        type: 'text',   ph: 'e.g. Vegan, Gluten-free' },
      { key: 'setup',          label: 'Setup & service included', type: 'toggle' },
      { key: 'cleanup',        label: 'Cleanup included',       type: 'toggle' },
      { key: 'kosher',         label: 'Kosher certified',       type: 'toggle' },
    ],
  },
  Transport: {
    types: ['Basic Shuttle', 'Group Transport', 'VIP Transport'],
    fields: [
      { key: 'vehicles',        label: 'Number of Vehicles',    type: 'number', ph: '1' },
      { key: 'vehicle_type',    label: 'Vehicle Type',          type: 'text',   ph: 'e.g. Minibus, Limousine, Van' },
      { key: 'capacity',        label: 'Capacity per Vehicle',  type: 'number', ph: '20' },
      { key: 'driver',          label: 'Driver included',       type: 'toggle' },
      { key: 'hours',           label: 'Hours of Service',      type: 'number', ph: '4' },
      { key: 'routes',          label: 'Routes / Area covered', type: 'text',   ph: 'e.g. Tel Aviv area', optional: true },
    ],
  },
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

function PhotoUpload({ label, hint, value, onChange, aspect = 'square' }) {
  const ref = useRef()
  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }
  const isLandscape = aspect === 'landscape'
  return (
    <div>
      <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">{label}</label>
      {hint && <p className="text-xs text-evo-muted font-medium mb-2">{hint}</p>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className={`relative rounded-[16px] overflow-hidden border-[1.5px] border-evo-purple-mid ${isLandscape ? 'h-32' : 'w-24 h-24'}`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
            <X size={12} className="text-white" />
          </button>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-evo-dim rounded-[16px] bg-evo-elevated transition-all hover:border-evo-purple-mid ${isLandscape ? 'w-full h-32' : 'w-24 h-24'}`}>
          {isLandscape ? <Image size={20} className="text-evo-muted" /> : <Camera size={20} className="text-evo-muted" />}
          <span className="text-[10px] font-bold text-evo-muted text-center px-2">{isLandscape ? 'Add photo' : 'Upload'}</span>
        </button>
      )}
    </div>
  )
}

function TemplateField({ field, value, onChange }) {
  if (field.type === 'toggle') {
    const on = value === true
    return (
      <div className="flex items-center justify-between bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3">
        <div>
          <p className="text-sm font-bold text-evo-text">{field.label}</p>
          {field.optional && <p className="text-[10px] text-evo-muted font-medium">Optional</p>}
        </div>
        <button onClick={() => onChange(!on)}
          className={`w-11 h-6 rounded-full transition-all ${on ? 'bg-evo-purple-mid' : 'bg-evo-border'}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    )
  }
  if (field.type === 'select') {
    return (
      <div>
        <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
          {field.label}{field.optional && <span className="ml-1 normal-case text-[10px]">· Optional</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {field.options.map(opt => (
            <button key={opt} onClick={() => onChange(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-[1.5px] transition-all ${
                value === opt ? 'bg-evo-elevated border-evo-purple-mid text-evo-purple' : 'border-evo-border text-evo-muted'
              }`}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    )
  }
  // text or number
  return (
    <div>
      <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
        {field.label}{field.optional && <span className="ml-1 normal-case text-[10px]">· Optional</span>}
      </label>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={field.ph}
        className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors"
      />
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────
export default function Onboarding() {
  const { navigate, setSupplierName, user, loadSupplierData } = useSupplier()
  const [step, setStep] = useState(0)
  const [validationError, setValidationError] = useState('')
  const [saving, setSaving] = useState(false)

  // Step 0: Category
  const [category, setCategory] = useState(null)

  // Step 1: Identity
  const [bizName,    setBizName]    = useState('')
  const [ownerName,  setOwnerName]  = useState('')
  const [experience, setExperience] = useState(null)
  const [teamSize,   setTeamSize]   = useState(null)

  // Step 2: Contact & Location
  const [phone,            setPhone]            = useState('')
  const [sameWhatsApp,     setSameWhatsApp]     = useState(true)
  const [whatsapp,         setWhatsApp]         = useState('')
  const [preferredContact, setPreferredContact] = useState('whatsapp')
  const [city,             setCity]             = useState('')
  const [customCity,       setCustomCity]       = useState('')
  const [address,          setAddress]          = useState('')

  // Step 3: Story
  const [bio,          setBio]          = useState('')
  const [instagram,    setInstagram]    = useState('')
  const [website,      setWebsite]      = useState('')
  const [profilePhoto, setProfilePhoto] = useState(null)

  // Step 4: Package
  const [pkgTypeName,    setPkgTypeName]    = useState('')
  const [pkgDesc,        setPkgDesc]        = useState('')
  const [pkgPrice,       setPkgPrice]       = useState('')
  const [pkgPriceType,   setPkgPriceType]   = useState('fixed')
  const [pkgMinGuests,   setPkgMinGuests]   = useState(50)
  const [pkgMaxGuests,   setPkgMaxGuests]   = useState(200)
  const [pkgMinHours,    setPkgMinHours]    = useState(3)
  const [pkgImage,       setPkgImage]       = useState(null)
  const [templateValues, setTemplateValues] = useState({})
  const [staffIncluded,  setStaffIncluded]  = useState(false)
  const [setupTime,      setSetupTime]      = useState(1)
  const [pkgDuration,    setPkgDuration]    = useState(5)
  const [pkgAddOns,      setPkgAddOns]      = useState([])
  const [addOnInput,     setAddOnInput]     = useState('')
  const [pkgBadge,       setPkgBadge]       = useState(null)

  // Step 5: Products
  const [products, setProducts] = useState([])
  const [editProduct, setEditProduct] = useState({ name: '', description: '', price: '', price_type: 'fixed', max_guests: '' })

  // Step 6: Pricing rules
  const [pricingRules, setPricingRules] = useState({})

  // Step 7: Documents
  const [hasInsurance, setHasInsurance] = useState(null)
  const [hasLicense,   setHasLicense]   = useState(null)

  const catIcon = CATEGORIES.find(c => c.name === category)?.icon || '📦'
  const finalCity = city === 'Other' ? customCity : city
  const tpl = PACKAGE_TEMPLATES[category] || null

  const setTplField = (key, val) => setTemplateValues(prev => ({ ...prev, [key]: val }))

  const validateStep = () => {
    if (step === 0 && !category)                                { return 'יש לבחור קטגוריה' }
    if (step === 1 && bizName.trim().length < 2)                { return 'שם העסק חייב להכיל לפחות 2 תווים' }
    if (step === 1 && (!experience || !teamSize))               { return 'יש לבחור וותק וגודל צוות' }
    if (step === 2 && phone.replace(/\D/g, '').length < 9)      { return 'מספר טלפון חייב להכיל לפחות 9 ספרות' }
    if (step === 2 && !city)                                    { return 'יש לבחור עיר' }
    if (step === 3 && bio.length < 20)                          { return 'תיאור קצר מדי — לפחות 20 תווים' }
    if (step === 4 && pkgTypeName.length === 0)                 { return 'יש לבחור סוג חבילה' }
    if (step === 4 && pkgDesc.length < 10)                      { return 'תיאור החבילה קצר מדי' }
    if (step === 4 && !(parseFloat(pkgPrice) > 0))              { return 'יש להזין מחיר חיובי' }
    return ''
  }

  const canNext = () => validateStep() === ''

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

  const addProduct = () => {
    if (!editProduct.name || !editProduct.price) return
    setProducts(prev => [...prev, { ...editProduct, id: Date.now() }])
    setEditProduct({ name: '', description: '', price: '', price_type: 'fixed', max_guests: '' })
  }

  const removeProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id))

  const addAddOn = () => {
    const v = addOnInput.trim()
    if (v && !pkgAddOns.includes(v)) {
      setPkgAddOns(prev => [...prev, v])
      setAddOnInput('')
    }
  }

  const next = async () => {
    const err = validateStep()
    if (err) { setValidationError(err); return }
    setValidationError('')

    if (step < STEPS.length - 1) {
      if (step === STEPS.length - 3) { // before softlock — save to Firestore
        setSaving(true)
        try {
          const uid = user?.uid || auth.currentUser?.uid
          if (!uid) throw new Error('לא מחובר')

          // 1. Save main vendor doc at vendors/{uid}
          await setDoc(doc(db, 'vendors', uid), {
            id:                    uid,
            business_name:         bizName,
            owner_full_name:       ownerName,
            category:              category,
            sub_category:          '',
            city:                  finalCity,
            full_address:          address,
            lat:                   null,
            lng:                   null,
            bio:                   bio,
            years_experience:      parseInt(experience) || 0,
            founded_year:          null,
            employee_count:        parseInt(teamSize) || 0,
            website_url:           website || '',
            instagram_handle:      instagram || '',
            email:                 auth.currentUser?.email || '',
            phone:                 phone,
            whatsapp_number:       sameWhatsApp ? phone : (whatsapp || phone),
            preferred_contact:     preferredContact || 'whatsapp',
            profile_photo_url:     profilePhoto || null,
            cover_photo_url:       null,
            is_approved:           false,
            is_active:             false,
            verification_status:   'pending',
            tags:                  [],
            total_events:          0,
            total_revenue:         0,
            avg_rating:            0,
            total_reviews:         0,
            response_rate:         0,
            avg_response_time_hours: 0,
            cancellation_rate:     0,
            repeat_client_rate:    0,
            stats_last_updated:    null,
            created_at:            serverTimestamp(),
            last_active_at:        serverTimestamp(),
          })

          // 2. Save first package to vendors/{uid}/packages/
          const pkgRef = collection(db, 'vendors', uid, 'packages')
          const pkgDoc = await addDoc(pkgRef, {
            vendor_id:    uid,
            name:         pkgTypeName,
            description:  pkgDesc,
            price:        parseFloat(pkgPrice),
            price_type:   pkgPriceType || 'fixed',
            min_guests:   parseInt(pkgMinGuests) || 0,
            max_guests:   parseInt(pkgMaxGuests) || 0,
            min_hours:    parseInt(pkgMinHours) || 0,
            is_popular:   pkgBadge === 'most_popular',
            is_available: true,
            sort_order:   0,
            created_at:   serverTimestamp(),
          })
          // Patch the id field into the doc
          await setDoc(doc(db, 'vendors', uid, 'packages', pkgDoc.id), { id: pkgDoc.id }, { merge: true })

          // 3. Save products to vendors/{uid}/products/
          for (let i = 0; i < products.length; i++) {
            const p = products[i]
            const prodRef = collection(db, 'vendors', uid, 'products')
            const prodDoc = await addDoc(prodRef, {
              vendor_id:    uid,
              name:         p.name,
              description:  p.description || '',
              category:     category,
              price:        parseFloat(p.price) || 0,
              price_type:   p.price_type || 'fixed',
              min_hours:    0,
              max_guests:   p.max_guests ? parseInt(p.max_guests) : 0,
              is_available: true,
              sort_order:   i,
              created_at:   serverTimestamp(),
            })
            await setDoc(doc(db, 'vendors', uid, 'products', prodDoc.id), { id: prodDoc.id }, { merge: true })
          }

          // 4. Save pricing rules to vendors/{uid}/pricing_rules/
          for (const [type, r] of Object.entries(pricingRules)) {
            const ruleRef = collection(db, 'vendors', uid, 'pricing_rules')
            const ruleDoc = await addDoc(ruleRef, {
              vendor_id:        uid,
              rule_type:        type,
              adjustment_type:  r.adjustType || 'percent',
              adjustment_value: parseFloat(r.value) || 0,
              valid_from:       null,
              valid_until:      null,
              notes:            '',
            })
            await setDoc(doc(db, 'vendors', uid, 'pricing_rules', ruleDoc.id), { id: ruleDoc.id }, { merge: true })
          }

          // 5. Save document records to vendors/{uid}/documents/
          const docsToSave = [
            hasInsurance !== null && { type: 'insurance',         url: '', expiry_date: null, is_verified: false, uploaded_at: serverTimestamp(), vendor_id: uid },
            hasLicense   !== null && { type: 'business_license',  url: '', expiry_date: null, is_verified: false, uploaded_at: serverTimestamp(), vendor_id: uid },
          ].filter(Boolean)

          for (const d of docsToSave) {
            const dRef = collection(db, 'vendors', uid, 'documents')
            const dDoc = await addDoc(dRef, d)
            await setDoc(doc(db, 'vendors', uid, 'documents', dDoc.id), { id: dDoc.id }, { merge: true })
          }

          // 6. Reload context
          await loadSupplierData(uid)
        } catch (saveErr) {
          console.error('Firestore save error:', saveErr)
          const isPermission = saveErr?.code === 'permission-denied'
          const isUnavailable = saveErr?.code === 'unavailable' || saveErr?.message?.includes('timeout') || saveErr?.message?.includes('TIMEOUT')
          if (isPermission) {
            setValidationError('שגיאה: Firestore לא מוגדר — בדוק ש-Firestore מופעל ב-Firebase Console. ניתן לדלג ולהמשיך.')
          } else if (isUnavailable) {
            setValidationError('אין חיבור ל-Firestore. ניתן לדלג ולהמשיך.')
          } else {
            setValidationError('שגיאה בשמירה — נסה שנית, או דלג והמשך.')
          }
          setSaving(false)
          return
        }
        setSaving(false)
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

              {/* Profile photo */}
              <div className="flex items-start gap-4">
                <PhotoUpload
                  label="Profile photo"
                  hint="A face builds trust — suppliers with photos get 2× more views"
                  value={profilePhoto}
                  onChange={setProfilePhoto}
                  aspect="square"
                />
                <div className="flex-1 pt-7">
                  <p className="text-xs font-semibold text-evo-muted leading-relaxed">
                    Upload a professional photo of yourself or your team. PNG, JPG or WEBP.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-evo-muted uppercase tracking-wider">About your business</label>
                  <span className={`text-xs font-bold ${bio.length > 20 ? 'text-evo-green' : 'text-evo-muted'}`}>{bio.length} / 300</span>
                </div>
                <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 300))} rows={4} placeholder="Describe what makes you stand out…"
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors resize-none" />

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

              {/* Package image */}
              <PhotoUpload
                label="Package photo"
                hint="Show clients what they're getting — a great photo drives bookings"
                value={pkgImage}
                onChange={setPkgImage}
                aspect="landscape"
              />

              {/* Package type selector */}
              {tpl && (
                <div>
                  <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">Package type</label>
                  <div className="space-y-2">
                    {tpl.types.map(t => (
                      <button key={t} onClick={() => setPkgTypeName(t)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] border-[1.5px] transition-all text-left ${
                          pkgTypeName === t ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                        }`}>
                        <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                          pkgTypeName === t ? 'bg-evo-purple-mid border-evo-purple-mid' : 'border-evo-dim'
                        }`}>
                          {pkgTypeName === t && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm font-bold ${pkgTypeName === t ? 'text-evo-purple' : 'text-evo-text'}`}>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing model */}
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

              {/* Price */}
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

              {/* Guests & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <Stepper label="Min guests"  value={pkgMinGuests} onChange={setPkgMinGuests} min={0} />
                <Stepper label="Max guests"  value={pkgMaxGuests} onChange={setPkgMaxGuests} min={0} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stepper label="Min hours"   value={pkgMinHours}  onChange={setPkgMinHours}  min={1} max={24} />
                <Stepper label="Setup time (h)" value={setupTime} onChange={setSetupTime}    min={0} max={12} />
              </div>

              {/* Staff included toggle */}
              <div className="flex items-center justify-between bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-evo-text">Staff included in price</p>
                  <p className="text-xs text-evo-muted font-medium">Technician, bartender, photographer, etc.</p>
                </div>
                <button onClick={() => setStaffIncluded(p => !p)}
                  className={`w-11 h-6 rounded-full transition-all ${staffIncluded ? 'bg-evo-purple-mid' : 'bg-evo-border'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${staffIncluded ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Description — MANDATORY */}
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Package description</label>
                <p className="text-xs text-evo-muted font-medium mb-2">
                  Describe what's included in this package and which products or equipment are provided. Be specific — clients want to know exactly what they're booking.
                </p>
                <textarea value={pkgDesc} onChange={e => setPkgDesc(e.target.value)} rows={4}
                  placeholder="e.g. Includes 2 JBL SRX815 speakers, 1 subwoofer, Pioneer DJM-900 mixer, 2 wireless microphones, and a full-event technician. Setup takes 2 hours and covers venues up to 300 guests."
                  className={`w-full bg-white border-[1.5px] rounded-xl px-4 py-3.5 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none transition-colors resize-none ${
                    pkgDesc.length > 10 ? 'border-evo-green' : 'border-evo-border focus:border-evo-purple-mid'
                  }`} />
                <p className={`text-xs font-bold mt-1 text-right ${pkgDesc.length > 10 ? 'text-evo-green' : 'text-evo-muted'}`}>{pkgDesc.length} chars</p>
              </div>

              {/* Category template fields */}
              {tpl && pkgTypeName && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-evo-muted uppercase tracking-wider">What's included — {pkgTypeName.split('(')[0].trim()}</p>
                  {tpl.fields.map(field => (
                    <TemplateField
                      key={field.key}
                      field={field}
                      value={templateValues[field.key]}
                      onChange={val => setTplField(field.key, val)}
                    />
                  ))}
                </div>
              )}

              {/* Add-ons */}
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Add-ons <span className="normal-case font-medium">(optional extras clients can request)</span></label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={addOnInput}
                    onChange={e => setAddOnInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addAddOn()}
                    placeholder="e.g. Extra microphone, LED truss…"
                    className="flex-1 bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors"
                  />
                  <button onClick={addAddOn}
                    className="w-11 h-11 rounded-xl bg-evo-elevated flex items-center justify-center shrink-0">
                    <Plus size={16} className="text-evo-purple" />
                  </button>
                </div>
                {pkgAddOns.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pkgAddOns.map(ao => (
                      <span key={ao} className="flex items-center gap-1.5 text-xs font-bold text-evo-purple bg-evo-elevated border-[1.5px] border-evo-dim px-3 py-1.5 rounded-full">
                        {ao}
                        <button onClick={() => setPkgAddOns(prev => prev.filter(a => a !== ao))}>
                          <X size={10} className="text-evo-muted" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Package badge */}
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Package badge <span className="normal-case font-medium text-[10px]">· Optional</span></label>
                <div className="flex flex-wrap gap-2">
                  {PKG_BADGES.map(b => (
                    <button key={b.value} onClick={() => setPkgBadge(pkgBadge === b.value ? null : b.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-[1.5px] transition-all ${
                        pkgBadge === b.value ? 'bg-evo-elevated border-evo-purple-mid text-evo-purple' : 'border-evo-border text-evo-muted'
                      }`}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 5: Individual Products ── */}
          {step === 5 && (
            <motion.div key="products" {...slide} className="px-6 pb-6 space-y-5">
              <StepTitle
                title="Individual products"
                sub="Add single items clients can book à la carte — optional but recommended"
              />

              {/* Existing products */}
              {products.length > 0 && (
                <div className="space-y-2">
                  {products.map(p => (
                    <div key={p.id} className="flex items-start gap-3 bg-white rounded-[16px] border-[1.5px] border-evo-border p-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-evo-text truncate">{p.name}</p>
                        {p.description && <p className="text-xs text-evo-muted font-medium mt-0.5 truncate">{p.description}</p>}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-extrabold text-evo-purple">₪{Number(p.price).toLocaleString()}</span>
                          <span className="text-[10px] font-semibold text-evo-muted bg-evo-elevated px-2 py-0.5 rounded-full">{p.price_type === 'per_hour' ? '/hr' : p.price_type === 'per_guest' ? '/guest' : 'fixed'}</span>
                          {p.max_guests && <span className="text-[10px] text-evo-muted">max {p.max_guests} guests</span>}
                        </div>
                      </div>
                      <button onClick={() => removeProduct(p.id)}
                        className="w-7 h-7 rounded-full bg-evo-elevated flex items-center justify-center shrink-0 mt-0.5">
                        <X size={12} className="text-evo-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add product form */}
              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 space-y-4">
                <p className="text-xs font-bold text-evo-muted uppercase tracking-wider">Add a product</p>

                <InputField label="Product name" value={editProduct.name}
                  onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Extra subwoofer, DJ table, Photo album" />

                <div>
                  <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Description <span className="normal-case font-medium text-[10px]">· Optional</span></label>
                  <textarea value={editProduct.description} rows={2}
                    onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of this item"
                    className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors resize-none" />
                </div>

                <div>
                  <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">Pricing model</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRICE_TYPES.map(pt => (
                      <button key={pt.value} onClick={() => setEditProduct(p => ({ ...p, price_type: pt.value }))}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-[14px] border-[1.5px] transition-all ${
                          editProduct.price_type === pt.value ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                        }`}>
                        <span className="text-lg">{pt.icon}</span>
                        <span className={`text-[10px] font-bold text-center ${editProduct.price_type === pt.value ? 'text-evo-purple' : 'text-evo-text'}`}>{pt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Price (₪)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-evo-muted font-bold text-sm">₪</span>
                      <input type="number" value={editProduct.price}
                        onChange={e => setEditProduct(p => ({ ...p, price: e.target.value }))}
                        placeholder="0"
                        className="w-full bg-white border-[1.5px] border-evo-border rounded-xl pl-7 pr-3 py-3 text-evo-text text-[14px] focus:outline-none focus:border-evo-purple-mid transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Max guests <span className="normal-case font-medium text-[10px]">· Opt.</span></label>
                    <input type="number" value={editProduct.max_guests}
                      onChange={e => setEditProduct(p => ({ ...p, max_guests: e.target.value }))}
                      placeholder="—"
                      className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-3 py-3 text-evo-text text-[14px] focus:outline-none focus:border-evo-purple-mid transition-colors" />
                  </div>
                </div>

                <button onClick={addProduct}
                  disabled={!editProduct.name || !editProduct.price}
                  className="w-full py-3 rounded-xl text-sm font-extrabold text-white transition-all disabled:opacity-30"
                  style={{ background: '#2D1B8A' }}>
                  <Plus size={14} className="inline mr-1.5" />Add product
                </button>
              </div>

              {products.length === 0 && (
                <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-[16px] border-[1.5px] border-evo-border">
                  <span className="text-2xl">💡</span>
                  <p className="text-xs text-evo-muted font-semibold leading-relaxed">
                    You can skip this and add individual products anytime from your Catalog.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── 6: Pricing Rules ── */}
          {step === 6 && (
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

          {/* ── 7: Documents ── */}
          {step === 7 && (
            <motion.div key="documents" {...slide} className="px-6 pb-6">
              <StepTitle title="Official documents" sub="Verified suppliers get 60% more leads" />

              <div className="space-y-3 mb-6">
                {[
                  { key: 'insurance', state: hasInsurance, setState: setHasInsurance, icon: '🛡️', title: 'Business Insurance', desc: 'Liability coverage certificate' },
                  { key: 'license',   state: hasLicense,   setState: setHasLicense,   icon: '📋', title: 'Business License',   desc: 'Osek murshe / Company registration' },
                ].map(doc => (
                  <div key={doc.key} className={`bg-white rounded-[20px] border-[1.5px] p-4 transition-all ${
                    doc.state === true ? 'border-evo-green' : 'border-evo-border'
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

          {/* ── 8: AI Analysis ── */}
          {step === 8 && (
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
                    {Math.min(100, 35 + (bio.length > 50 ? 10 : 0) + (profilePhoto ? 5 : 0) + (instagram ? 5 : 0) + (pkgTypeName ? 10 : 0) + (pkgImage ? 5 : 0) + (products.length > 0 ? 5 : 0) + (Object.keys(pricingRules).length > 0 ? 10 : 0) + (hasInsurance ? 8 : 0) + (hasLicense ? 7 : 0))}%
                  </p>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#EEF0FF' }}>
                  <motion.div initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, 35 + (bio.length > 50 ? 10 : 0) + (profilePhoto ? 5 : 0) + (instagram ? 5 : 0) + (pkgTypeName ? 10 : 0) + (pkgImage ? 5 : 0) + (products.length > 0 ? 5 : 0) + (Object.keys(pricingRules).length > 0 ? 10 : 0) + (hasInsurance ? 8 : 0) + (hasLicense ? 7 : 0))}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #2D1B8A, #6C5CE7)' }} />
                </div>
              </div>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5 space-y-4 mb-4">
                {[
                  { label: 'Category & Identity',  value: 95 },
                  { label: 'Profile Photo',         value: profilePhoto ? 100 : 0 },
                  { label: 'Contact Info',          value: phone ? 100 : 40 },
                  { label: 'Package Ready',         value: pkgTypeName && pkgDesc.length > 10 ? 100 : 30 },
                  { label: 'Package Photo',         value: pkgImage ? 100 : 20 },
                  { label: 'Products Listed',       value: products.length > 0 ? 100 : 0 },
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
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${value === 100 ? 'bg-evo-green' : value > 0 ? 'bg-evo-accent' : 'bg-evo-border'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  `${category} specialist`,
                  experience >= 7 ? '7+ years experience' : experience >= 3 ? '3+ years experience' : 'Growing talent',
                  teamSize > 5 ? 'Full team' : teamSize > 1 ? 'Small team' : 'Solo artist',
                  products.length > 0 ? `${products.length} product${products.length > 1 ? 's' : ''} listed` : null,
                ].filter(Boolean).map(chip => (
                  <span key={chip} className="px-3 py-1.5 text-xs font-bold text-evo-purple bg-evo-elevated border-[1.5px] border-evo-dim"
                    style={{ borderRadius: 50 }}>✓ {chip}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 9: Soft Lock ── */}
          {step === 9 && (
            <motion.div key="softlock" {...slide} className="px-6 pb-6">
              <div className="flex flex-col items-center text-center pt-4 pb-6">
                <div className="text-5xl mb-5">🎯</div>
                <h2 className="text-[24px] font-extrabold text-evo-text mb-2" style={{ letterSpacing: '-0.5px' }}>
                  Create your supplier<br />account to go live.
                </h2>
                <p className="text-sm font-semibold text-evo-muted">Your profile is ready — one step left</p>
              </div>

              <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-5 mb-4">
                {['Category selected', 'Identity & story', 'Package created', 'Products added', 'Pricing rules set', 'Go live!'].map((label, i) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-evo-border last:border-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: i < 5 ? '#00C48C' : 'transparent', border: i < 5 ? 'none' : '2px solid #E8E8F0' }}>
                      {i < 5 ? <Check size={12} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-evo-border" />}
                    </div>
                    <p className={`text-sm font-bold flex-1 ${i < 5 ? 'text-evo-text' : 'text-evo-muted'}`}>{label}</p>
                    {i < 5 && <span className="text-[10px] font-extrabold text-evo-green bg-evo-green/10 px-2 py-0.5 rounded-full">Done</span>}
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

          {/* ── 10: Dashboard Preview ── */}
          {step === 10 && (
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
                    <p className="text-sm font-bold text-evo-text truncate">{pkgTypeName || 'Your Package'}</p>
                    <p className="text-xs text-evo-muted font-medium">{category} · {pkgPriceType === 'per_hour' ? 'Per hour' : pkgPriceType === 'per_guest' ? 'Per guest' : 'Fixed'}</p>
                  </div>
                  <p className="text-lg font-extrabold text-evo-purple shrink-0">
                    {pkgPrice ? `₪${Number(pkgPrice).toLocaleString()}` : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-evo-muted font-medium pt-2 border-t border-evo-border flex-wrap">
                  <span>👥 {pkgMinGuests}–{pkgMaxGuests} guests</span>
                  <span>·</span>
                  <span>⏱ min {pkgMinHours}h</span>
                  {products.length > 0 && <><span>·</span><span>📦 {products.length} product{products.length > 1 ? 's' : ''}</span></>}
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
        {validationError ? (
          <div className="mb-3">
            <p className="text-sm font-semibold text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {validationError}
            </p>
            {step === STEPS.length - 3 && (
              <button
                onClick={() => { setValidationError(''); setStep(s => s + 1) }}
                className="w-full mt-2 py-2.5 rounded-xl border-[1.5px] border-evo-border text-evo-muted text-sm font-semibold text-center"
              >
                דלג על שמירה — המשך בכל זאת
              </button>
            )}
          </div>
        ) : null}
        <button onClick={next} disabled={saving}
          className="w-full py-4 text-white text-base font-extrabold transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            borderRadius: 14,
            background: '#2D1B8A',
            boxShadow: '0 4px 20px rgba(45,27,105,0.35)',
          }}>
          {saving ? 'שומר...' :
           step === 5 ? (products.length > 0 ? `Continue with ${products.length} product${products.length > 1 ? 's' : ''}` : 'Skip for now') :
           step === 6 ? (Object.keys(pricingRules).length > 0 ? 'Save & Continue' : 'Skip for now') :
           step === 7 ? (hasInsurance !== null || hasLicense !== null ? 'Continue' : 'Skip for now') :
           step === 8 ? '✦ Activate My Profile' :
           step === 9 ? 'Sign Up / Sign In' :
           step === 10 ? 'Go to dashboard →' :
           'Continue'}
        </button>
      </div>
    </div>
  )
}
