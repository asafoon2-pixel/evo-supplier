import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronRight, Star, Edit3, X, Check } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { catalog } from '../data/index'

function PackageCard({ pkg, onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-evo-card rounded-2xl border border-evo-border overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {pkg.popular && (
          <div className="absolute top-3 left-3 bg-evo-accent text-black text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full">
            Most Booked
          </div>
        )}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="text-white text-lg font-light">{pkg.name}</p>
            <p className="text-evo-accent text-sm font-medium">₪{pkg.price.toLocaleString()}</p>
          </div>
          <button
            onClick={() => onEdit(pkg)}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <Edit3 size={13} className="text-white" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <p className="text-evo-muted text-xs leading-relaxed font-light mb-4">{pkg.description}</p>

        <div className="space-y-2 mb-4">
          {pkg.features.slice(0, 4).map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check size={11} className="text-evo-accent mt-0.5 shrink-0" />
              <p className="text-white text-xs font-light">{f}</p>
            </div>
          ))}
          {pkg.features.length > 4 && (
            <p className="text-evo-dim text-xs ml-4">+{pkg.features.length - 4} more</p>
          )}
        </div>

        {pkg.addOns.length > 0 && (
          <div className="border-t border-evo-border pt-3">
            <p className="text-evo-dim text-[10px] tracking-widest uppercase mb-2">Add-ons</p>
            {pkg.addOns.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <p className="text-evo-muted text-xs">{a.name}</p>
                <p className="text-white text-xs">+₪{a.price.toLocaleString()} <span className="text-evo-dim">/ {a.unit}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function EditSheet({ pkg, onClose }) {
  const [name, setName] = useState(pkg.name)
  const [price, setPrice] = useState(String(pkg.price))
  const [description, setDescription] = useState(pkg.description)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full bg-evo-card rounded-t-3xl border-t border-evo-border p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="text-white text-base font-light">Edit Package</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-evo-elevated border border-evo-border flex items-center justify-center">
            <X size={14} className="text-evo-muted" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-evo-dim text-xs tracking-widest uppercase mb-2">Package Name</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-evo-elevated border border-evo-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-evo-accent/50"
            />
          </div>
          <div>
            <p className="text-evo-dim text-xs tracking-widest uppercase mb-2">Base Price (₪)</p>
            <input
              value={price}
              onChange={e => setPrice(e.target.value)}
              type="number"
              className="w-full bg-evo-elevated border border-evo-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-evo-accent/50"
            />
          </div>
          <div>
            <p className="text-evo-dim text-xs tracking-widest uppercase mb-2">Description</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-evo-elevated border border-evo-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-evo-accent/50 resize-none"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-4 rounded-full bg-evo-accent text-black text-sm font-medium tracking-[0.12em] uppercase"
        >
          Save Changes
        </button>

        <p className="text-center text-evo-dim text-xs mt-3">Changes will be reflected in future EVO matches</p>
      </motion.div>
    </motion.div>
  )
}

export default function Catalog() {
  const [editPkg, setEditPkg] = useState(null)

  return (
    <div className="w-full min-h-screen bg-evo-black pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <p className="text-xs tracking-[0.25em] uppercase text-evo-accent mb-1">EVO</p>
        <h1 className="text-2xl font-light text-white">Your Catalog</h1>
        <p className="text-evo-muted text-sm mt-1 font-light">Packages visible to EVO's matching engine</p>
      </div>

      {/* Stats bar */}
      <div className="px-6 mb-6">
        <div className="bg-evo-card rounded-2xl border border-evo-border p-4 flex items-center justify-between">
          <div className="text-center">
            <p className="text-white text-xl font-light">{catalog.length}</p>
            <p className="text-evo-dim text-xs mt-0.5">Packages</p>
          </div>
          <div className="w-px h-8 bg-evo-border" />
          <div className="text-center">
            <p className="text-evo-accent text-xl font-light">Signature</p>
            <p className="text-evo-dim text-xs mt-0.5">Most Booked</p>
          </div>
          <div className="w-px h-8 bg-evo-border" />
          <div className="text-center">
            <p className="text-white text-xl font-light flex items-center gap-1">
              <Star size={14} className="text-evo-accent fill-evo-accent" />
              4.9
            </p>
            <p className="text-evo-dim text-xs mt-0.5">Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Package list */}
      <div className="px-6 space-y-4">
        {catalog.map(pkg => (
          <PackageCard key={pkg.id} pkg={pkg} onEdit={setEditPkg} />
        ))}
      </div>

      {/* Add package */}
      <div className="px-6 mt-6">
        <button className="w-full py-4 rounded-2xl border border-dashed border-evo-border flex items-center justify-center gap-3 hover:border-evo-accent/30 transition-all">
          <Plus size={16} className="text-evo-muted" />
          <span className="text-evo-muted text-sm tracking-wide">Add New Package</span>
        </button>
      </div>

      {/* EVO note */}
      <div className="px-6 mt-6">
        <div className="bg-evo-card rounded-2xl border-l-2 border-evo-accent p-4">
          <p className="text-xs tracking-[0.2em] uppercase text-evo-accent mb-2">EVO Matching</p>
          <p className="text-evo-muted text-xs leading-relaxed font-light">
            Your packages are used by EVO to match and price your services for incoming leads. Keep them accurate for better match quality.
          </p>
        </div>
      </div>

      {/* Edit sheet */}
      <AnimatePresence>
        {editPkg && <EditSheet pkg={editPkg} onClose={() => setEditPkg(null)} />}
      </AnimatePresence>
    </div>
  )
}
