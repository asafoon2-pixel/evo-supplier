import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Zap, Plus, Minus, X, Image } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const PRICE_TYPES = [
  { value: 'fixed',     label: 'Fixed price',  icon: '📦', desc: 'One total price' },
  { value: 'per_hour',  label: 'Per hour',     icon: '⏱',  desc: 'Hourly rate' },
  { value: 'per_guest', label: 'Per guest',    icon: '👥', desc: 'Per head' },
]

const PKG_BADGES = [
  { value: 'most_popular',    label: '⭐ Most Popular' },
  { value: 'best_value',      label: '💰 Best Value' },
  { value: 'evo_recommended', label: '✦ EVO Recommended' },
]

const PACKAGE_TEMPLATES = {
  Sound: {
    types: ['Small Event (up to 150 guests)', 'Medium Event (150–300 guests)', 'Large Event (300–600 guests)', 'Premium / Festival (600+)'],
    fields: [
      { key: 'speakers',      label: 'Speakers',               type: 'text',   ph: 'e.g. 2× JBL SRX815' },
      { key: 'subwoofers',    label: 'Subwoofers',             type: 'text',   ph: 'e.g. 1× JBL SRX818', optional: true },
      { key: 'mixer',         label: 'Mixer / Console',        type: 'text',   ph: 'e.g. Pioneer DJM-900' },
      { key: 'microphones',   label: 'Microphones',            type: 'number', ph: '2' },
      { key: 'dj_connection', label: 'DJ Connection included', type: 'toggle' },
      { key: 'technician',    label: 'Technician',             type: 'select', options: ['None', 'Setup only', 'Full event'] },
    ],
  },
  Lighting: {
    types: ['Basic Lighting', 'Party Lighting', 'Club Setup', 'Premium Production'],
    fields: [
      { key: 'par_lights',   label: 'PAR Lights',        type: 'number', ph: '8' },
      { key: 'moving_heads', label: 'Moving Heads',      type: 'number', ph: '4' },
      { key: 'led_strips',   label: 'LED Strips',        type: 'text',   ph: 'e.g. 10m RGB strips', optional: true },
      { key: 'fog_machine',  label: 'Fog Machine',       type: 'toggle' },
      { key: 'laser',        label: 'Laser Show',        type: 'toggle', optional: true },
      { key: 'operator',     label: 'Lighting Operator', type: 'select', options: ['None', 'Setup only', 'Full event'] },
    ],
  },
  Decor: {
    types: ['Basic Setup', 'Styled Event', 'Premium Design', 'Instagram Experience'],
    fields: [
      { key: 'floral',       label: 'Floral Arrangements',     type: 'text',   ph: 'e.g. 10 table centerpieces' },
      { key: 'centerpieces', label: 'Centerpieces',            type: 'number', ph: '10' },
      { key: 'backdrop',     label: 'Backdrop included',       type: 'toggle' },
      { key: 'color_scheme', label: 'Signature Color Scheme',  type: 'text',   ph: 'e.g. White & gold' },
      { key: 'props',        label: 'Props & Accessories',     type: 'text',   ph: 'e.g. Candles, lanterns', optional: true },
      { key: 'setup_crew',   label: 'Setup Crew (people)',     type: 'number', ph: '2' },
    ],
  },
  Bar: {
    types: ['Basic Bar', 'Classic Bar', 'Premium Bar', 'Open Bar Luxury'],
    fields: [
      { key: 'bartenders',       label: 'Bartenders',                  type: 'number', ph: '2' },
      { key: 'bar_equipment',    label: 'Bar Equipment',               type: 'text',   ph: 'e.g. Full mobile bar, ice machine' },
      { key: 'alcohol_included', label: 'Alcohol included in price',   type: 'toggle' },
      { key: 'cocktail_menu',    label: 'Cocktail Menu',               type: 'text',   ph: 'e.g. 8 signature cocktails' },
      { key: 'non_alcoholic',    label: 'Non-alcoholic options',       type: 'toggle' },
      { key: 'hours_service',    label: 'Hours of Service',            type: 'number', ph: '5' },
    ],
  },
  Photography: {
    types: ['Basic Coverage', 'Standard Event', 'Premium Coverage', 'Full Production'],
    fields: [
      { key: 'photographers',  label: 'Photographers',             type: 'number', ph: '1' },
      { key: 'videographers',  label: 'Videographers',             type: 'number', ph: '1', optional: true },
      { key: 'hours_coverage', label: 'Hours of Coverage',         type: 'number', ph: '6' },
      { key: 'editing_days',   label: 'Editing & Delivery (days)', type: 'number', ph: '14' },
      { key: 'drone',          label: 'Drone footage',             type: 'toggle', optional: true },
      { key: 'photo_booth',    label: 'Photo booth',               type: 'toggle', optional: true },
    ],
  },
  Entertainment: {
    types: ['Basic Performer', 'Pro Performer', 'Headliner', 'Full Experience'],
    fields: [
      { key: 'performers',       label: 'Number of Performers',  type: 'number', ph: '1' },
      { key: 'performance_type', label: 'Type of Performance',   type: 'text',   ph: 'e.g. DJ set, Live band, MC' },
      { key: 'set_duration',     label: 'Set Duration (hours)',  type: 'number', ph: '3' },
      { key: 'equipment',        label: 'Equipment included',    type: 'toggle' },
      { key: 'sound_system',     label: 'Sound system included', type: 'toggle', optional: true },
      { key: 'lighting_show',    label: 'Lighting show',         type: 'toggle', optional: true },
    ],
  },
  Catering: {
    types: ['Finger Food', 'Buffet', 'Premium Catering', 'Live Stations'],
    fields: [
      { key: 'dishes_count', label: 'Number of Dishes',          type: 'number', ph: '12' },
      { key: 'waitstaff',    label: 'Waitstaff Included',        type: 'number', ph: '3' },
      { key: 'dietary',      label: 'Dietary Options',           type: 'text',   ph: 'e.g. Vegan, Gluten-free' },
      { key: 'setup',        label: 'Setup & service included',  type: 'toggle' },
      { key: 'cleanup',      label: 'Cleanup included',          type: 'toggle' },
      { key: 'kosher',       label: 'Kosher certified',          type: 'toggle' },
    ],
  },
  Transport: {
    types: ['Basic Shuttle', 'Group Transport', 'VIP Transport'],
    fields: [
      { key: 'vehicles',     label: 'Number of Vehicles',    type: 'number', ph: '1' },
      { key: 'vehicle_type', label: 'Vehicle Type',          type: 'text',   ph: 'e.g. Minibus, Limousine, Van' },
      { key: 'capacity',     label: 'Capacity per Vehicle',  type: 'number', ph: '20' },
      { key: 'driver',       label: 'Driver included',       type: 'toggle' },
      { key: 'hours',        label: 'Hours of Service',      type: 'number', ph: '4' },
      { key: 'routes',       label: 'Routes / Area covered', type: 'text',   ph: 'e.g. Tel Aviv area', optional: true },
    ],
  },
}

// Fallback category list when no supplier category is set
const ALL_CATEGORIES = Object.keys(PACKAGE_TEMPLATES)

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

function PhotoUpload({ value, onChange }) {
  const ref = useRef()
  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }
  return (
    <div>
      <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">Package photo</label>
      <p className="text-xs text-evo-muted font-medium mb-2">Show clients what they're getting — a great photo drives bookings</p>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative h-32 rounded-[16px] overflow-hidden border-[1.5px] border-evo-purple-mid">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
            <X size={12} className="text-white" />
          </button>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()}
          className="w-full h-32 flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-evo-dim rounded-[16px] bg-evo-elevated hover:border-evo-purple-mid transition-all">
          <Image size={22} className="text-evo-muted" />
          <span className="text-xs font-bold text-evo-muted">Add package photo</span>
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

export default function PackageForm() {
  const { navigate, editPackage, savePackage } = useSupplier()
  const isEdit = !!editPackage
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  // Pre-fill from existing package if editing
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [pkgTypeName,    setPkgTypeName]    = useState(isEdit ? (editPackage.name || '') : '')
  const [pkgDesc,        setPkgDesc]        = useState(isEdit ? (editPackage.description || '') : '')
  const [pkgPrice,       setPkgPrice]       = useState(isEdit ? String(editPackage.price || '') : '')
  const [pkgPriceType,   setPkgPriceType]   = useState('fixed')
  const [pkgMinGuests,   setPkgMinGuests]   = useState(isEdit ? (editPackage.minGuests || 50) : 50)
  const [pkgMaxGuests,   setPkgMaxGuests]   = useState(isEdit ? (editPackage.maxGuests || 200) : 200)
  const [pkgMinHours,    setPkgMinHours]    = useState(3)
  const [pkgImage,       setPkgImage]       = useState(isEdit ? (editPackage.image || null) : null)
  const [templateValues, setTemplateValues] = useState({})
  const [staffIncluded,  setStaffIncluded]  = useState(false)
  const [setupTime,      setSetupTime]      = useState(1)
  const [pkgAddOns,      setPkgAddOns]      = useState(
    isEdit && editPackage.addOns ? editPackage.addOns.map(a => a.name) : []
  )
  const [addOnInput,     setAddOnInput]     = useState('')
  const [pkgBadge,       setPkgBadge]       = useState(isEdit && editPackage.popular ? 'most_popular' : null)

  const setTplField = (key, val) => setTemplateValues(prev => ({ ...prev, [key]: val }))
  const addAddOn = () => {
    const v = addOnInput.trim()
    if (v && !pkgAddOns.includes(v)) { setPkgAddOns(prev => [...prev, v]); setAddOnInput('') }
  }

  const tpl = PACKAGE_TEMPLATES[selectedCategory] || null
  const canSave = pkgTypeName.length > 0 && pkgDesc.length > 10 && parseFloat(pkgPrice) > 0

  // ── Category picker (new package) or template picker (edit) ──
  if (!selectedCategory) {
    return (
      <div className="flex flex-col min-h-screen bg-evo-bg">
        <div className="px-6 pt-4 pb-3 shrink-0 bg-white border-b border-evo-border">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate('catalog')}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-evo-elevated">
              <ArrowLeft size={18} className="text-evo-text" />
            </button>
            <div>
              <h1 className="text-[18px] font-extrabold text-evo-text">{isEdit ? 'Edit Package' : 'New Package'}</h1>
              {isEdit && <p className="text-xs font-semibold text-evo-muted">{editPackage.name}</p>}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-3">
          <p className="text-sm font-semibold text-evo-muted mb-1">
            {isEdit ? 'Select category to load template fields' : 'What category is this package for?'}
          </p>
          {isEdit && (
            <p className="text-xs text-evo-muted mb-4">Your existing data (name, price, description, photo) is already loaded.</p>
          )}
          {ALL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] border-[1.5px] border-evo-border bg-white text-left hover:border-evo-purple-mid transition-all">
              <span className="text-sm font-bold text-evo-text">{cat}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-evo-bg">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 shrink-0 bg-white border-b border-evo-border">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedCategory(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-evo-elevated">
            <ArrowLeft size={18} className="text-evo-text" />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-extrabold text-evo-text leading-tight">
              {isEdit ? 'Edit Package' : 'New Package'}
            </h1>
            <p className="text-xs font-semibold text-evo-muted">{selectedCategory}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-6 py-5 space-y-5 pb-8">

          {/* Tip */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-[12px]" style={{ background: '#EEF0FF', border: '1.5px solid #C5B8F0' }}>
            <Zap size={13} className="text-evo-accent shrink-0" />
            <p className="text-xs font-bold text-evo-purple">Suppliers with packages get 3× more bookings</p>
          </div>

          {/* Package image */}
          <PhotoUpload value={pkgImage} onChange={setPkgImage} />

          {/* Package type */}
          {tpl && (
            <div>
              <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">Package type</label>
              <div className="space-y-2">
                {tpl.types.map(t => (
                  <button key={t} onClick={() => setPkgTypeName(t)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] border-[1.5px] transition-all text-left ${
                      pkgTypeName === t ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
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

          {/* Guests & timing */}
          <div className="grid grid-cols-2 gap-3">
            <Stepper label="Min guests"     value={pkgMinGuests} onChange={setPkgMinGuests} min={0} />
            <Stepper label="Max guests"     value={pkgMaxGuests} onChange={setPkgMaxGuests} min={0} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stepper label="Min hours"      value={pkgMinHours}  onChange={setPkgMinHours}  min={1} max={24} />
            <Stepper label="Setup time (h)" value={setupTime}    onChange={setSetupTime}    min={0} max={12} />
          </div>

          {/* Staff toggle */}
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

          {/* Description — mandatory */}
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

          {/* Template fields */}
          {tpl && pkgTypeName && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-evo-muted uppercase tracking-wider">What's included — {pkgTypeName.split('(')[0].trim()}</p>
              {tpl.fields.map(field => (
                <TemplateField key={field.key} field={field} value={templateValues[field.key]} onChange={val => setTplField(field.key, val)} />
              ))}
            </div>
          )}

          {/* Add-ons */}
          <div>
            <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
              Add-ons <span className="normal-case font-medium">(optional extras)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={addOnInput} onChange={e => setAddOnInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAddOn()}
                placeholder="e.g. Extra microphone, LED truss…"
                className="flex-1 bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors" />
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

          {/* Badge */}
          <div>
            <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
              Package badge <span className="normal-case font-medium text-[10px]">· Optional</span>
            </label>
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
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 pt-2 bg-evo-bg shrink-0">
        {saveError && (
          <p className="text-sm font-semibold text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-3">
            {saveError}
          </p>
        )}
        <button
          onClick={async () => {
            setSaveError('')
            setSaving(true)
            try {
              await savePackage({
                id:           isEdit ? editPackage.id : undefined,
                name:         pkgTypeName,
                description:  pkgDesc,
                price:        parseFloat(pkgPrice),
                price_type:   pkgPriceType,
                min_guests:   pkgMinGuests,
                max_guests:   pkgMaxGuests,
                min_hours:    pkgMinHours,
                is_popular:   pkgBadge === 'most_popular',
                is_available: true,
                sort_order:   isEdit ? (editPackage.sort_order || 0) : 0,
              })
              navigate('catalog')
            } catch (err) {
              setSaveError('שגיאה בשמירה — נסה שנית')
            } finally {
              setSaving(false)
            }
          }}
          disabled={!canSave || saving}
          className="w-full py-4 text-white text-base font-extrabold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{ borderRadius: 14, background: '#2D1B8A', boxShadow: canSave ? '0 4px 20px rgba(45,27,105,0.35)' : 'none' }}>
          {saving ? 'שומר...' : isEdit ? 'שמור שינויים' : 'שמור חבילה'}
        </button>
      </div>
    </div>
  )
}
