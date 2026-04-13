import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, Check, Image } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

function compressImage(file, maxPx = 600, quality = 0.72) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onerror = () => resolve(null)
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onerror = () => resolve(null)
      img.onload = () => {
        try {
          const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
          const canvas = document.createElement('canvas')
          canvas.width  = Math.round(img.width  * scale)
          canvas.height = Math.round(img.height * scale)
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch { resolve(null) }
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}

function ProductImageUpload({ value, onChange }) {
  const ref = useRef()
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    onChange(compressed || null)
  }
  return (
    <div>
      <label className="text-xs font-bold text-evo-muted block mb-1.5 uppercase tracking-wider">
        תמונת מוצר <span className="normal-case font-semibold text-evo-accent text-[10px]">· חובה</span>
      </label>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative h-28 rounded-[14px] overflow-hidden border-[1.5px] border-evo-green">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => { onChange(null); if (ref.current) ref.current.value = '' }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
            <X size={12} className="text-white" />
          </button>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()}
          className="w-full h-28 flex flex-col items-center justify-center gap-2 border-[2px] border-dashed border-evo-accent/40 rounded-[14px] bg-evo-elevated hover:border-evo-accent transition-all">
          <Image size={20} className="text-evo-accent" />
          <span className="text-xs font-bold text-evo-accent">הוסף תמונה — חובה</span>
        </button>
      )}
    </div>
  )
}

const PRICE_TYPES = [
  { value: 'fixed',     label: 'מחיר קבוע', icon: '📦' },
  { value: 'per_hour',  label: 'לשעה',      icon: '⏱' },
  { value: 'per_guest', label: 'לאורח',     icon: '👥' },
]

const EMPTY_PRODUCT = { name: '', description: '', price: '', price_type: 'fixed', max_guests: '', min_hours: '', image: null }

export default function ProductsForm() {
  const { navigate, editPackage, saveProduct, vendorData } = useSupplier()

  const [productList, setProductList] = useState([])
  const [form, setForm]               = useState(EMPTY_PRODUCT)
  const [showForm, setShowForm]       = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState('')

  const addProduct = () => {
    if (!form.name || !form.price || !form.image) return
    setProductList(prev => [...prev, { ...form, id: `prod-${Date.now()}` }])
    setForm(EMPTY_PRODUCT)
    setShowForm(false)
  }

  const removeProduct = (id) => setProductList(prev => prev.filter(p => p.id !== id))

  const priceLabel = (pt) => pt === 'per_hour' ? '/שעה' : pt === 'per_guest' ? '/אורח' : 'קבוע'

  return (
    <div className="flex flex-col min-h-screen bg-evo-bg">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 shrink-0 bg-white border-b border-evo-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('catalog')}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-evo-elevated">
            <ArrowLeft size={18} className="text-evo-text" />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-extrabold text-evo-text leading-tight">
              {editPackage ? `${editPackage.name} — מוצרים` : 'מוצרים בודדים'}
            </h1>
            <p className="text-xs font-semibold text-evo-muted">פריטים שלקוחות יכולים להוסיף</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 pb-28">

        {/* Tip banner */}
        <div className="flex items-center gap-3 bg-white rounded-[16px] border-[1.5px] border-evo-border p-3.5 mb-5">
          <span className="text-2xl">💡</span>
          <p className="text-xs text-evo-muted font-semibold leading-relaxed">
            מוצרים הם פריטים בודדים שלקוחות יכולים להוסיף לכל הזמנה — מושלם לשדרוגים ותוספות.
          </p>
        </div>

        {/* Product list */}
        <AnimatePresence>
          {productList.map(p => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex items-start gap-3 bg-white rounded-[16px] border-[1.5px] border-evo-green p-3.5 mb-3">
              {p.image ? (
                <img src={p.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-evo-elevated flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={13} className="text-evo-purple" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-evo-text truncate">{p.name}</p>
                {p.description && <p className="text-xs text-evo-muted font-medium mt-0.5 line-clamp-2">{p.description}</p>}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-evo-purple">₪{Number(p.price).toLocaleString()}</span>
                  <span className="text-[10px] font-semibold text-evo-muted bg-evo-elevated px-2 py-0.5 rounded-full">{priceLabel(p.price_type)}</span>
                  {p.max_guests && <span className="text-[10px] text-evo-muted">עד {p.max_guests} אורחים</span>}
                </div>
              </div>
              <button onClick={() => removeProduct(p.id)}
                className="w-7 h-7 rounded-full bg-evo-elevated flex items-center justify-center shrink-0">
                <X size={12} className="text-evo-muted" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add product toggle */}
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="w-full py-3.5 rounded-[16px] border-[1.5px] border-dashed border-evo-dim flex items-center justify-center gap-2 mb-4 hover:border-evo-purple-mid transition-all">
            <Plus size={15} className="text-evo-muted" />
            <span className="text-sm font-bold text-evo-muted">הוסף מוצר נוסף</span>
          </button>
        )}

        {/* Add product form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 space-y-4">

              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-evo-muted uppercase tracking-wider">הוסף מוצר</p>
                {productList.length > 0 && (
                  <button onClick={() => setShowForm(false)} className="text-[10px] font-bold text-evo-muted">ביטול</button>
                )}
              </div>

              {/* Product image — required */}
              <ProductImageUpload value={form.image} onChange={img => setForm(p => ({ ...p, image: img }))} />

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">שם המוצר</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="לדוגמה: סאב נוסף, שולחן DJ, אלבום תמונות"
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors" />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
                  תיאור <span className="normal-case font-medium text-[10px]">· אופציונלי</span>
                </label>
                <textarea value={form.description} rows={2}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="תיאור קצר של הפריט"
                  className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-[14px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors resize-none" />
              </div>

              {/* Pricing model */}
              <div>
                <label className="text-xs font-bold text-evo-muted block mb-3 uppercase tracking-wider">מודל תמחור</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_TYPES.map(pt => (
                    <button key={pt.value} onClick={() => setForm(p => ({ ...p, price_type: pt.value }))}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-[14px] border-[1.5px] transition-all ${
                        form.price_type === pt.value ? 'bg-evo-elevated border-evo-purple-mid' : 'bg-white border-evo-border'
                      }`}>
                      <span className="text-lg">{pt.icon}</span>
                      <span className={`text-[10px] font-bold text-center ${form.price_type === pt.value ? 'text-evo-purple' : 'text-evo-text'}`}>{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price + max guests */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">מחיר (₪)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-evo-muted font-bold text-sm">₪</span>
                    <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-white border-[1.5px] border-evo-border rounded-xl pl-7 pr-3 py-3 text-evo-text text-[14px] focus:outline-none focus:border-evo-purple-mid transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">
                    מקס אורחים <span className="normal-case font-medium text-[10px]">· אופ.</span>
                  </label>
                  <input type="number" value={form.max_guests} onChange={e => setForm(p => ({ ...p, max_guests: e.target.value }))}
                    placeholder="—"
                    className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-3 py-3 text-evo-text text-[14px] focus:outline-none focus:border-evo-purple-mid transition-colors" />
                </div>
              </div>

              <button onClick={addProduct} disabled={!form.name || !form.price || !form.image}
                className="w-full py-3 rounded-xl text-sm font-extrabold text-white transition-all disabled:opacity-30 active:scale-[0.98]"
                style={{ background: '#2D1B8A' }}>
                <Plus size={14} className="inline mr-1.5" />הוסף מוצר
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
              for (let i = 0; i < productList.length; i++) {
                const p = productList[i]
                await saveProduct({
                  name:         p.name,
                  description:  p.description || '',
                  category:     vendorData?.category || '',
                  price:        parseFloat(p.price) || 0,
                  price_type:   p.price_type,
                  min_hours:    parseInt(p.min_hours) || 0,
                  max_guests:   p.max_guests ? parseInt(p.max_guests) : 0,
                  image_url:    p.image || null,
                  is_available: true,
                  sort_order:   i,
                })
              }
              navigate('catalog')
            } catch (err) {
              setSaveError('שגיאה בשמירה — נסה שנית')
            } finally {
              setSaving(false)
            }
          }}
          disabled={saving}
          className="w-full py-4 text-white text-base font-extrabold transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ borderRadius: 14, background: '#2D1B8A', boxShadow: '0 4px 20px rgba(45,27,105,0.35)' }}>
          {saving ? 'שומר...' : productList.length > 0 ? `שמור ${productList.length} מוצר${productList.length > 1 ? 'ים' : ''}` : 'סיום'}
        </button>
      </div>
    </div>
  )
}
