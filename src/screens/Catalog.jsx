import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, Edit3, X, Check, Trash2 } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'

const PRICE_TYPE_LABEL = { fixed: 'מחיר קבוע', per_hour: 'לשעה', per_guest: 'לאורח' }

function PackageCard({ pkg, onEdit, onProducts, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[20px] border-[1.5px] border-evo-border overflow-hidden"
      style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}
    >
      {/* Header bar */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-evo-text text-base font-bold leading-tight flex-1">{pkg.name}</p>
          <div className="flex items-center gap-1 shrink-0">
            {pkg.is_popular && (
              <span className="text-[10px] font-bold bg-evo-accent/10 text-evo-accent px-2 py-0.5 rounded-full border border-evo-dim">
                ⭐ פופולרי
              </span>
            )}
            {!pkg.is_available && (
              <span className="text-[10px] font-bold bg-evo-muted/10 text-evo-muted px-2 py-0.5 rounded-full border border-evo-border">
                לא זמין
              </span>
            )}
          </div>
        </div>

        {pkg.description && (
          <p className="text-evo-muted text-xs leading-relaxed mb-3 line-clamp-2">{pkg.description}</p>
        )}

        {/* Price & meta */}
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <p className="text-evo-purple text-lg font-extrabold">
            ₪{(pkg.price || 0).toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-evo-muted bg-evo-elevated px-2 py-0.5 rounded-full">
            {PRICE_TYPE_LABEL[pkg.price_type] || pkg.price_type}
          </span>
          {(pkg.min_guests > 0 || pkg.max_guests > 0) && (
            <span className="text-[11px] text-evo-muted">
              {pkg.min_guests}–{pkg.max_guests} אורחים
            </span>
          )}
          {pkg.min_hours > 0 && (
            <span className="text-[11px] text-evo-muted">{pkg.min_hours}+ שעות</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button onClick={() => onEdit(pkg)}
          className="flex-1 py-2.5 rounded-xl text-xs font-extrabold border-[1.5px] border-evo-border text-evo-muted flex items-center justify-center gap-1.5 hover:border-evo-purple-mid hover:text-evo-purple transition-all">
          <Edit3 size={12} />עריכה
        </button>
        <button onClick={() => onProducts(pkg)}
          className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-evo-elevated border-[1.5px] border-evo-dim text-evo-purple flex items-center justify-center gap-1.5 hover:border-evo-purple-mid transition-all">
          <Plus size={12} />מוצרים
        </button>
        <button onClick={() => onDelete(pkg.id)}
          className="w-10 py-2.5 rounded-xl border-[1.5px] border-evo-border text-evo-muted flex items-center justify-center hover:border-red-300 hover:text-red-400 transition-all">
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  )
}

function EditSheet({ pkg, onClose }) {
  const { savePackage } = useSupplier()
  const [name, setName]               = useState(pkg.name || '')
  const [price, setPrice]             = useState(String(pkg.price || ''))
  const [description, setDescription] = useState(pkg.description || '')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('שם החבילה לא יכול להיות ריק'); return }
    if (!(parseFloat(price) > 0)) { setError('יש להזין מחיר חיובי'); return }
    setSaving(true)
    setError('')
    try {
      await savePackage({
        ...pkg,
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
      })
      onClose()
    } catch (err) {
      setError('שגיאה בשמירה — נסה שנית')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full bg-white rounded-t-3xl border-t border-evo-border p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="text-evo-text text-base font-bold">עריכת חבילה</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-evo-elevated border border-evo-border flex items-center justify-center">
            <X size={14} className="text-evo-muted" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-2">שם החבילה</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-evo-bg border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-sm focus:outline-none focus:border-evo-purple-mid transition-colors"
            />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-2">מחיר בסיס (₪)</p>
            <input
              value={price}
              onChange={e => setPrice(e.target.value)}
              type="number"
              className="w-full bg-evo-bg border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-sm focus:outline-none focus:border-evo-purple-mid transition-colors"
            />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-muted mb-2">תיאור</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-evo-bg border-[1.5px] border-evo-border rounded-xl px-4 py-3 text-evo-text text-sm focus:outline-none focus:border-evo-purple-mid transition-colors resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mt-4">
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 py-4 rounded-[14px] bg-evo-purple-mid text-white text-sm font-semibold tracking-[0.08em] uppercase disabled:opacity-60"
          style={{ boxShadow: 'rgba(45,27,105,0.35) 0px 4px 16px' }}
        >
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>

        <p className="text-center text-evo-muted text-xs mt-3">השינויים ישפיעו על התאמות EVO עתידיות</p>
      </motion.div>
    </motion.div>
  )
}

export default function Catalog() {
  const { navigate, setEditPackage, packages, deletePackage, vendorData } = useSupplier()
  const [editPkg, setEditPkg]           = useState(null)
  const [deletingId, setDeletingId]     = useState(null)
  const [deleteError, setDeleteError]   = useState('')

  const openEdit     = (pkg) => { setEditPackage(pkg); navigate('packageForm') }
  const openProducts = (pkg) => { setEditPackage(pkg); navigate('productsForm') }

  const handleDelete = async (pkgId) => {
    setDeleteError('')
    setDeletingId(pkgId)
    try {
      await deletePackage(pkgId)
    } catch (err) {
      setDeleteError('שגיאה במחיקה — נסה שנית')
    } finally {
      setDeletingId(null)
    }
  }

  const avgRating = vendorData?.avg_rating || 0

  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white border-b border-evo-border">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>הקטלוג שלי</h1>
        <p className="text-evo-muted text-sm mt-1">חבילות גלויות למנוע ההתאמה של EVO</p>
      </div>

      {/* Stats bar */}
      <div className="px-6 mt-5 mb-5">
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 flex items-center justify-between"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="text-center">
            <p className="text-evo-text text-xl font-bold">{packages.length}</p>
            <p className="text-evo-muted text-xs mt-0.5">חבילות</p>
          </div>
          <div className="w-px h-8 bg-evo-border" />
          <div className="text-center">
            <p className="text-evo-accent text-xl font-bold truncate max-w-[100px]">
              {packages.length > 0 ? packages[0].name : '—'}
            </p>
            <p className="text-evo-muted text-xs mt-0.5">חבילה ראשית</p>
          </div>
          <div className="w-px h-8 bg-evo-border" />
          <div className="text-center">
            <p className="text-evo-text text-xl font-bold flex items-center gap-1">
              <Star size={14} className="text-evo-accent fill-evo-accent" />
              {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            </p>
            <p className="text-evo-muted text-xs mt-0.5">דירוג</p>
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="px-6 mb-3">
          <p className="text-sm font-semibold text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {deleteError}
          </p>
        </div>
      )}

      {/* Package list */}
      <div className="px-6 space-y-4">
        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-evo-text text-sm font-semibold mb-1">אין חבילות עדיין</p>
            <p className="text-evo-muted text-xs">הוסף חבילה כדי שEVO יוכל להתאים אותך ללידים</p>
          </div>
        ) : (
          packages.map(pkg => (
            <div key={pkg.id} className={deletingId === pkg.id ? 'opacity-40 pointer-events-none' : ''}>
              <PackageCard pkg={pkg} onEdit={openEdit} onProducts={openProducts} onDelete={handleDelete} />
            </div>
          ))
        )}
      </div>

      {/* Add package */}
      <div className="px-6 mt-5">
        <button onClick={() => { setEditPackage(null); navigate('packageForm') }}
          className="w-full py-4 rounded-[20px] border-[1.5px] border-dashed border-evo-border flex items-center justify-center gap-3 hover:border-evo-purple-mid transition-all group">
          <Plus size={16} className="text-evo-muted group-hover:text-evo-purple transition-colors" />
          <span className="text-evo-muted text-sm font-medium group-hover:text-evo-purple transition-colors">הוסף חבילה חדשה</span>
        </button>
      </div>

      {/* EVO note */}
      <div className="px-6 mt-5">
        <div className="bg-white rounded-[20px] border-l-[3px] border-evo-accent border-[1.5px] border-evo-border p-4"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent mb-2">EVO Matching</p>
          <p className="text-evo-muted text-xs leading-relaxed">
            החבילות שלך משמשות את EVO להתאמה ותמחור השירותים שלך. שמור אותן מדויקות לאיכות התאמה טובה יותר.
          </p>
        </div>
      </div>

      {/* Inline edit sheet */}
      <AnimatePresence>
        {editPkg && <EditSheet pkg={editPkg} onClose={() => setEditPkg(null)} />}
      </AnimatePresence>
    </div>
  )
}
