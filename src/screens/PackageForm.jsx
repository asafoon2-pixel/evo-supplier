import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Plus, Minus, X, Image } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

// ── 7-tier guest count pricing (Catering, Bar) ──────────────────
const GUEST_TIERS = [
  { key: '0_50',    label: '0–50 אורחים' },
  { key: '50_100',  label: '50–100 אורחים' },
  { key: '100_150', label: '100–150 אורחים' },
  { key: '150_200', label: '150–200 אורחים' },
  { key: '200_250', label: '200–250 אורחים' },
  { key: '250_300', label: '250–300 אורחים' },
  { key: '300_plus',label: '300+ אורחים' },
]

// ── 3-tier event size pricing (Decor) ───────────────────────────
const SIZE_TIERS = [
  { key: 'small',  label: 'קטן' },
  { key: 'medium', label: 'בינוני' },
  { key: 'large',  label: 'גדול' },
]

// ── Per-category config per spec ─────────────────────────────────
const CATEGORY_CONFIG = {
  Sound: {
    pricing_model: 'flat_per_package',
    price_label: 'מחיר לחבילה (₪)',
    packages: [
      { id: 'up_100',  name: 'עד 100 אורחים' },
      { id: 'up_200',  name: 'עד 200 אורחים' },
      { id: 'up_400',  name: 'עד 400 אורחים' },
      { id: 'premium', name: 'פרמיום — ללא הגבלת כמות' },
    ],
    fields: [
      { key: 'speakers',       label: 'מספר רמקולים',       type: 'number', ph: '4' },
      { key: 'microphones',    label: 'מספר מיקרופונים',    type: 'number', ph: '2' },
      { key: 'lighting_heads', label: 'מספר ראשי תאורה',    type: 'number', ph: '0' },
      { key: 'technician',     label: 'טכנאי צמוד באירוע',  type: 'toggle' },
    ],
  },
  Lighting: {
    pricing_model: 'flat_per_package',
    price_label: 'מחיר לחבילה (₪)',
    packages: [
      { id: 'up_100',  name: 'עד 100 אורחים' },
      { id: 'up_200',  name: 'עד 200 אורחים' },
      { id: 'up_400',  name: 'עד 400 אורחים' },
      { id: 'premium', name: 'פרמיום — ללא הגבלת כמות' },
    ],
    fields: [
      { key: 'par_lights',   label: 'פנסי PAR',            type: 'number', ph: '8' },
      { key: 'moving_heads', label: 'ראשים נעים',           type: 'number', ph: '4' },
      { key: 'total_heads',  label: 'סה״כ ראשי תאורה',     type: 'number', ph: '12' },
      { key: 'technician',   label: 'טכנאי צמוד באירוע',   type: 'toggle' },
    ],
  },
  Catering: {
    pricing_model: 'per_head_tiers',
    price_label: 'מחיר לראש לפי כמות אורחים (₪)',
    packages: [
      { id: 'basic',    name: 'בסיסית',  desc: 'מנות ראשונות בלבד (בופה)' },
      { id: 'standard', name: 'סטנדרט', desc: 'מנות ראשונות + מנות עיקריות' },
      { id: 'premium',  name: 'פרמיום',  desc: 'ראשונות + עיקריות + קינוח + תוספות פרמיום' },
    ],
    fields: [
      { key: 'serving_equipment', label: 'כלי הגשה',           type: 'toggle' },
      { key: 'tablecloths',       label: 'מפות שולחן',          type: 'toggle' },
      { key: 'cutlery_type',      label: 'צלחות וסכו"ם',        type: 'select', options: ['חד פעמי', 'רב פעמי'] },
      { key: 'heating_stations',  label: 'עמדות חימום',          type: 'toggle' },
      { key: 'waitstaff_count',   label: 'צוות הגשה (אנשים)',   type: 'number', ph: '3' },
    ],
  },
  Bar: {
    pricing_model: 'per_head_tiers',
    price_label: 'מחיר לראש לפי כמות אורחים (₪)',
    packages: [
      { id: 'basic',   name: 'בסיסית',  desc: 'אלכוהול בסיסי' },
      { id: 'classic', name: 'קלאסית',  desc: 'אלכוהול קלאסי + קוקטיילים מובחרים' },
      { id: 'premium', name: 'פרמיום',  desc: 'אלכוהול פרמיום + קוקטיילים + ברמן שואו / תחנות בר' },
    ],
    fields: [
      { key: 'bartenders_count', label: 'ברמנים כלולים',   type: 'number', ph: '2' },
      { key: 'bar_station',      label: 'עמדת בר',          type: 'toggle' },
      { key: 'ice_included',     label: 'קרח',               type: 'toggle' },
      { key: 'glasses_included', label: 'כוסות',             type: 'toggle' },
      { key: 'bar_decor',        label: 'תפאורת בר',         type: 'toggle' },
    ],
  },
  Photography: {
    pricing_model: 'flat_per_package',
    price_label: 'מחיר קבוע לחבילה (₪)',
    packages: [
      { id: 'basic',    name: 'חבילה 1', desc: 'צלם סטילס אחד' },
      { id: 'standard', name: 'חבילה 2', desc: 'סטילס + וידאו + Movie After' },
      { id: 'premium',  name: 'פרמיום',  desc: 'סטילס + וידאו + מגנטים + Movie After + עריכה' },
    ],
    fields: [
      { key: 'photographers',  label: 'צלמי סטילס',              type: 'number', ph: '1' },
      { key: 'videographers',  label: 'צלמי וידאו',               type: 'number', ph: '0', optional: true },
      { key: 'hours_coverage', label: 'שעות צילום',               type: 'number', ph: '6' },
      { key: 'magnets',        label: 'צילום מגנטים (פרינטר)',    type: 'toggle', optional: true },
      { key: 'movie_after',    label: 'Movie After',              type: 'toggle', optional: true },
      { key: 'edited_photos',  label: 'תמונות ערוכות (כמות)',     type: 'number', ph: '100', optional: true },
      { key: 'extra_hour_fee', label: 'תוספת שעה חריגה (₪/שעה)', type: 'number', ph: '300', optional: true },
    ],
  },
  Decor: {
    pricing_model: 'size_tiers',
    price_label: 'מחיר לפי גודל אירוע (₪)',
    packages: [
      { id: 'basic',    name: 'בסיסית', desc: 'עיצוב שולחנות — אגרטלים וצמחייה' },
      { id: 'standard', name: 'סטנדרט', desc: 'שולחנות + חופה/במה + תאורה דקורטיבית + פלטת צבעים' },
      { id: 'premium',  name: 'פרמיום', desc: 'הכל + הדפסות ותפאורה מותאמת אישית' },
    ],
  },
  Entertainment: {
    pricing_model: 'flat_per_package',
    price_label: 'מחיר לחבילה (₪)',
    packages: [
      { id: 'basic',    name: 'בסיסי' },
      { id: 'standard', name: 'מקצועי' },
      { id: 'premium',  name: 'פרמיום' },
    ],
    fields: [
      { key: 'performers',       label: 'מספר מבצעים',    type: 'number', ph: '1' },
      { key: 'performance_type', label: 'סוג הופעה',       type: 'text',   ph: 'DJ, להקה חיה, MC' },
      { key: 'set_duration',     label: 'משך סט (שעות)', type: 'number', ph: '3' },
      { key: 'equipment',        label: 'ציוד כלול',        type: 'toggle' },
    ],
  },
  Transport: {
    pricing_model: 'flat_per_package',
    price_label: 'מחיר לחבילה (₪)',
    packages: [
      { id: 'basic', name: 'הסעה בסיסית' },
      { id: 'group', name: 'הסעת קבוצה' },
      { id: 'vip',   name: 'VIP' },
    ],
    fields: [
      { key: 'vehicles',     label: 'מספר כלי רכב',  type: 'number', ph: '1' },
      { key: 'vehicle_type', label: 'סוג רכב',         type: 'text',   ph: 'מיניבוס, לימוזינה' },
      { key: 'capacity',     label: 'קיבולת לרכב',   type: 'number', ph: '20' },
      { key: 'driver',       label: 'נהג כלול',         type: 'toggle' },
      { key: 'hours',        label: 'שעות שירות',     type: 'number', ph: '4' },
    ],
  },
  Equipment: {
    pricing_model: 'free_text',
    price_label: 'מחיר לחבילה (₪)',
    packages: [
      { id: 'pkg1', name: 'חבילה 1' },
      { id: 'pkg2', name: 'חבילה 2' },
      { id: 'pkg3', name: 'חבילה 3' },
    ],
  },
}

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG)

// ── UI sub-components ────────────────────────────────────────────
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
      <label className="text-xs font-bold text-evo-muted block mb-1 uppercase tracking-wider">
        תמונת חבילה <span className="text-evo-accent text-[10px] normal-case font-medium">· מומלץ מאוד</span>
      </label>
      <p className="text-xs text-evo-muted font-medium mb-2">ניתן לשמור בלי תמונה — החבילה תישמר כטיוטה עד שתוסיף תמונה</p>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative h-36 rounded-[16px] overflow-hidden border-[1.5px] border-evo-purple-mid">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
            <X size={12} className="text-white" />
          </button>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()}
          className="w-full h-36 flex flex-col items-center justify-center gap-2 border-[2px] border-dashed border-evo-dim rounded-[16px] bg-evo-elevated hover:border-evo-purple-mid transition-all">
          <Image size={24} className="text-evo-muted" />
          <span className="text-xs font-bold text-evo-muted">הוסף תמונה לחבילה</span>
          <span className="text-[10px] text-evo-dim">בלי תמונה — יישמר כטיוטה</span>
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
          {field.optional && <p className="text-[10px] text-evo-muted font-medium">אופציונלי</p>}
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
          {field.label}{field.optional && <span className="ml-1 normal-case text-[10px]">· אופ.</span>}
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
        {field.label}{field.optional && <span className="ml-1 normal-case text-[10px]">· אופ.</span>}
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

// ── Main component ───────────────────────────────────────────────
export default function PackageForm() {
  const { navigate, editPackage, savePackage } = useSupplier()
  const isEdit = !!editPackage

  const [selectedCategory, setSelectedCategory] = useState(null)

  // Package type selection (from fixed list per category)
  const [pkgTypeId, setPkgTypeId] = useState(isEdit ? (editPackage.package_type_id || '') : '')

  // Flat / fixed pricing
  const [pkgPrice,     setPkgPrice]     = useState(isEdit ? String(editPackage.price || '') : '')

  // Per-head 7-tier pricing (Catering, Bar)
  const [tierPrices, setTierPrices] = useState(() => {
    if (isEdit && editPackage.guest_tier_prices) return editPackage.guest_tier_prices
    return Object.fromEntries(GUEST_TIERS.map(t => [t.key, '']))
  })

  // Size-tier pricing (Decor)
  const [sizePrices, setSizePrices] = useState(() => {
    if (isEdit && editPackage.size_prices) return editPackage.size_prices
    return { small: '', medium: '', large: '' }
  })

  // Free text (Equipment)
  const [customName, setCustomName] = useState(isEdit ? (editPackage.custom_name || '') : '')
  const [customDesc, setCustomDesc] = useState(isEdit ? (editPackage.description || '') : '')

  // Shared
  const [pkgImage,       setPkgImage]       = useState(isEdit ? (editPackage.image_url || null) : null)
  const [templateValues, setTemplateValues] = useState({})
  const [pkgDesc,        setPkgDesc]        = useState(isEdit ? (editPackage.description || '') : '')
  const [saveError,      setSaveError]      = useState('')
  const [saving,         setSaving]         = useState(false)

  const setTplField = (key, val) => setTemplateValues(prev => ({ ...prev, [key]: val }))

  const cfg = selectedCategory ? CATEGORY_CONFIG[selectedCategory] : null
  const selectedPkg = cfg ? cfg.packages.find(p => p.id === pkgTypeId) : null

  // ── Validation ───────────────────────────────────────────────
  // Image is recommended but not blocking — packages without an image
  // are saved as drafts (is_available: false) until an image is added.
  const canSave = (() => {
    if (!cfg) return false
    if (cfg.pricing_model === 'free_text') {
      return customName.length > 1 && customDesc.length > 5 && parseFloat(pkgPrice) > 0
    }
    if (!pkgTypeId) return false
    if (cfg.pricing_model === 'per_head_tiers') {
      return Object.values(tierPrices).some(v => parseFloat(v) > 0)
    }
    if (cfg.pricing_model === 'size_tiers') {
      return Object.values(sizePrices).some(v => parseFloat(v) > 0)
    }
    return parseFloat(pkgPrice) > 0
  })()

  // ── Category picker screen ───────────────────────────────────
  if (!selectedCategory) {
    return (
      <div className="flex flex-col min-h-screen bg-evo-bg">
        <div className="px-6 pt-4 pb-3 shrink-0 bg-white border-b border-evo-border">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('catalog')}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-evo-elevated">
              <ArrowLeft size={18} className="text-evo-text" />
            </button>
            <h1 className="text-[18px] font-extrabold text-evo-text">
              {isEdit ? 'עריכת חבילה' : 'חבילה חדשה'}
            </h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-3">
          <p className="text-sm font-semibold text-evo-muted mb-4">מה הקטגוריה של החבילה?</p>
          {ALL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] border-[1.5px] border-evo-border bg-white hover:border-evo-purple-mid transition-all">
              <span className="text-sm font-bold text-evo-text">{cat}</span>
              <span className="text-xs text-evo-muted font-medium">
                {CATEGORY_CONFIG[cat].packages.length} חבילות
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Main form ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-evo-bg">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 shrink-0 bg-white border-b border-evo-border">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedCategory(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-evo-elevated">
            <ArrowLeft size={18} className="text-evo-text" />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-extrabold text-evo-text leading-tight">
              {isEdit ? 'עריכת חבילה' : 'חבילה חדשה'}
            </h1>
            <p className="text-xs font-semibold text-evo-muted">{selectedCategory}</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="px-6 py-5 space-y-6 pb-10">

          {/* Tip */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-[12px]"
            style={{ background: '#EEF0FF', border: '1.5px solid #C5B8F0' }}>
            <Zap size={13} className="text-evo-accent shrink-0" />
            <p className="text-xs font-bold text-evo-purple">ספקים עם חבילות מקבלים 3× יותר הזמנות</p>
          </div>

          {/* ── Package type selector (fixed per category) ── */}
          {cfg.pricing_model !== 'free_text' && (
            <div>
              <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">
                סוג חבילה
              </label>
              <div className="space-y-2">
                {cfg.packages.map(pkg => (
                  <button key={pkg.id} onClick={() => setPkgTypeId(pkg.id)}
                    className={`w-full flex flex-col gap-0.5 px-4 py-3.5 rounded-[16px] border-[1.5px] text-right transition-all ${
                      pkgTypeId === pkg.id
                        ? 'bg-evo-elevated border-evo-purple-mid'
                        : 'bg-white border-evo-border'
                    }`}>
                    <span className={`text-sm font-extrabold ${pkgTypeId === pkg.id ? 'text-evo-purple' : 'text-evo-text'}`}>
                      {pkg.name}
                    </span>
                    {pkg.desc && (
                      <span className="text-[11px] font-medium text-evo-muted">{pkg.desc}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Photo (required) ── */}
          <PhotoUpload value={pkgImage} onChange={setPkgImage} />

          {/* ══════════════ PRICING SECTION ══════════════ */}

          {/* flat_per_package — one price */}
          {cfg.pricing_model === 'flat_per_package' && (
            <div>
              <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
                {cfg.price_label}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-evo-muted font-bold">₪</span>
                <input type="number" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl pl-8 pr-4 py-3.5 text-evo-text text-[15px] focus:outline-none focus:border-evo-purple-mid transition-colors" />
              </div>
            </div>
          )}

          {/* per_head_tiers — 7 price tiers */}
          {cfg.pricing_model === 'per_head_tiers' && (
            <div>
              <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">
                {cfg.price_label}
              </label>
              <div className="space-y-2">
                {GUEST_TIERS.map(tier => (
                  <div key={tier.key} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-evo-muted w-32 shrink-0 text-right">{tier.label}</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-evo-muted text-sm font-bold">₪</span>
                      <input
                        type="number"
                        value={tierPrices[tier.key]}
                        onChange={e => setTierPrices(prev => ({ ...prev, [tier.key]: e.target.value }))}
                        placeholder="מחיר לראש"
                        className="w-full bg-white border-[1.5px] border-evo-border rounded-xl pl-7 pr-3 py-2.5 text-evo-text text-sm focus:outline-none focus:border-evo-purple-mid transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* size_tiers — small / medium / large prices */}
          {cfg.pricing_model === 'size_tiers' && (
            <div>
              <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">
                {cfg.price_label}
              </label>
              <div className="space-y-3">
                {SIZE_TIERS.map(tier => (
                  <div key={tier.key}>
                    <label className="text-xs font-semibold text-evo-muted block mb-1">{tier.label}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-evo-muted font-bold">₪</span>
                      <input
                        type="number"
                        value={sizePrices[tier.key]}
                        onChange={e => setSizePrices(prev => ({ ...prev, [tier.key]: e.target.value }))}
                        placeholder="0"
                        className="w-full bg-white border-[1.5px] border-evo-border rounded-xl pl-8 pr-4 py-3 text-evo-text text-[14px] focus:outline-none focus:border-evo-purple-mid transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* free_text — Equipment: custom name + description + price */}
          {cfg.pricing_model === 'free_text' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">שם החבילה</label>
                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)}
                  placeholder="לדוגמה: חבילת קיץ — שמשיות + מאווררים"
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
                  מה כלול בחבילה — פירוט פריטים וכמויות
                </label>
                <textarea value={customDesc} onChange={e => setCustomDesc(e.target.value)} rows={4}
                  placeholder="לדוגמה: 10 כסאות נוח + 3 שמשיות גדולות + 2 מאווררים תעשייתיים + שולחן שירות. כולל הובלה והרכבה."
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">מחיר לחבילה (₪)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-evo-muted font-bold">₪</span>
                  <input type="number" value={pkgPrice} onChange={e => setPkgPrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border-[1.5px] border-evo-border rounded-xl pl-8 pr-4 py-3.5 text-evo-text text-[15px] focus:outline-none focus:border-evo-purple-mid transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* ── Category-specific fields ── */}
          {cfg.fields && cfg.fields.length > 0 && pkgTypeId && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-evo-muted uppercase tracking-wider">
                מה כלול — {selectedPkg?.name || ''}
              </p>
              {cfg.fields.map(field => (
                <TemplateField
                  key={field.key}
                  field={field}
                  value={templateValues[field.key]}
                  onChange={val => setTplField(field.key, val)}
                />
              ))}
            </div>
          )}

          {/* ── Description (non-free_text categories) ── */}
          {cfg.pricing_model !== 'free_text' && (
            <div>
              <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
                תיאור נוסף <span className="normal-case font-medium text-[10px]">· אופציונלי</span>
              </label>
              <textarea value={pkgDesc} onChange={e => setPkgDesc(e.target.value)} rows={3}
                placeholder="הוסף פרטים שיעזרו ללקוח להבין את הערך של החבילה…"
                className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors resize-none" />
            </div>
          )}

        </motion.div>
      </div>

      {/* ── Save CTA ── */}
      <div className="px-6 pb-6 pt-2 bg-evo-bg shrink-0">
        {saveError && (
          <p className="text-sm font-semibold text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-3">
            {saveError}
          </p>
        )}
        <button
          disabled={!canSave || saving}
          onClick={async () => {
            setSaveError('')
            setSaving(true)
            try {
              const base = {
                id:           isEdit ? editPackage.id : undefined,
                category:     selectedCategory,
                package_type_id: cfg.pricing_model !== 'free_text' ? pkgTypeId : null,
                name:         cfg.pricing_model === 'free_text'
                                ? customName
                                : (selectedPkg?.name || pkgTypeId),
                description:  cfg.pricing_model === 'free_text' ? customDesc : pkgDesc,
                pricing_model: cfg.pricing_model,
                image_url:    pkgImage || null,
                template_data: templateValues,
                is_available: !!pkgImage,
                sort_order:   isEdit ? (editPackage.sort_order || 0) : 0,
              }

              // Pricing payload per model
              if (cfg.pricing_model === 'flat_per_package') {
                Object.assign(base, { price: parseFloat(pkgPrice), price_type: 'fixed' })
              } else if (cfg.pricing_model === 'per_head_tiers') {
                Object.assign(base, {
                  price_type: 'per_head',
                  guest_tier_prices: Object.fromEntries(
                    Object.entries(tierPrices).map(([k, v]) => [k, parseFloat(v) || null])
                  ),
                  // Derive base price from smallest tier for backwards compat
                  price: parseFloat(tierPrices['0_50']) || 0,
                })
              } else if (cfg.pricing_model === 'size_tiers') {
                Object.assign(base, {
                  price_type: 'per_event_size',
                  size_prices: Object.fromEntries(
                    Object.entries(sizePrices).map(([k, v]) => [k, parseFloat(v) || null])
                  ),
                  price: parseFloat(sizePrices['small']) || 0,
                })
              } else if (cfg.pricing_model === 'free_text') {
                Object.assign(base, { price: parseFloat(pkgPrice), price_type: 'fixed' })
              }

              await savePackage(base)
              navigate('catalog')
            } catch (err) {
              console.error(err)
              setSaveError('שגיאה בשמירה — נסה שנית')
            } finally {
              setSaving(false)
            }
          }}
          className="w-full py-4 text-white text-base font-extrabold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{ borderRadius: 14, background: '#2D1B8A', boxShadow: canSave ? '0 4px 20px rgba(45,27,105,0.35)' : 'none' }}>
          {saving ? 'שומר...' : isEdit ? 'שמור שינויים' : 'שמור חבילה'}
        </button>
      </div>
    </div>
  )
}
