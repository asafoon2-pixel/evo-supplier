import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MapPin, Clock, Award, ChevronRight, Edit3, LogOut, Shield, Bell, HelpCircle } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { supplierProfile, insights } from '../data/index'

function StatPill({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-evo-text text-xl font-bold">{value}</p>
      <p className="text-evo-muted text-xs mt-0.5">{label}</p>
    </div>
  )
}

function PortfolioGrid({ images }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {images.map((img, i) => (
        <div key={i} className={`overflow-hidden rounded-lg bg-evo-elevated ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
          style={{ height: i === 0 ? 200 : 96 }}>
          <img src={img} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )
}

function MenuItem({ icon: Icon, label, sublabel, onPress, danger }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-4 py-4 border-b border-evo-border last:border-0"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-evo-red/10' : 'bg-evo-elevated'}`}>
        <Icon size={16} className={danger ? 'text-evo-red' : 'text-evo-muted'} />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-medium ${danger ? 'text-evo-red' : 'text-evo-text'}`}>{label}</p>
        {sublabel && <p className="text-evo-muted text-xs mt-0.5">{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={14} className="text-evo-dim" />}
    </button>
  )
}

export default function Profile() {
  const { navigate } = useSupplier()
  const p = supplierProfile

  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Cover + Avatar */}
      <div className="relative h-48">
        <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <button className="absolute top-12 right-5 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Edit3 size={14} className="text-white" />
        </button>
      </div>

      {/* Avatar + identity */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl border-[3px] border-white overflow-hidden"
            style={{ boxShadow: 'rgba(45,27,105,0.15) 0px 4px 16px' }}>
            <img src={p.avatar} alt={p.ownerName} className="w-full h-full object-cover" />
          </div>
          <div className="pb-1">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent">{p.category}</p>
            <h1 className="text-[22px] font-extrabold text-evo-text leading-tight" style={{ letterSpacing: '-0.5px' }}>{p.name}</h1>
            <p className="text-evo-muted text-sm">{p.ownerName}</p>
          </div>
        </div>

        {/* Rating & meta */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-evo-accent fill-evo-accent" />
            <span className="text-evo-text text-sm font-semibold">{p.rating}</span>
            <span className="text-evo-muted text-xs">({p.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-evo-muted text-xs">
            <MapPin size={11} />
            <span>{p.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-evo-muted text-xs">
            <Clock size={11} />
            <span>{p.responseTime}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border p-4 flex items-center justify-around mb-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <StatPill label="Events" value={p.eventsCount} />
          <div className="w-px h-8 bg-evo-border" />
          <StatPill label="Acceptance" value={`${insights.acceptanceRate}%`} />
          <div className="w-px h-8 bg-evo-border" />
          <StatPill label="Avg Deal" value={`₪${(insights.avgDealSize / 1000).toFixed(1)}k`} />
        </div>

        {/* About */}
        <div className="mb-5">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted mb-3">About</p>
          <p className="text-evo-muted text-sm leading-relaxed">{p.description}</p>
        </div>

        {/* Service area & price range */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-xl border-[1.5px] border-evo-border p-3">
            <p className="text-evo-muted text-xs mb-1">Service Area</p>
            <p className="text-evo-text text-sm font-medium">{p.serviceArea}</p>
          </div>
          <div className="bg-white rounded-xl border-[1.5px] border-evo-border p-3">
            <p className="text-evo-muted text-xs mb-1">Price Range</p>
            <p className="text-evo-text text-sm font-medium">{p.priceRange}</p>
          </div>
        </div>

        {/* Portfolio */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-evo-muted">Portfolio</p>
            <button className="text-evo-accent text-xs font-medium tracking-wide">Manage</button>
          </div>
          <PortfolioGrid images={p.portfolio} />
        </div>

        {/* EVO Status */}
        <div className="bg-white rounded-[20px] border-l-[3px] border-evo-accent border-[1.5px] border-evo-border p-4 mb-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-evo-accent" />
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-evo-accent">EVO Verified</p>
          </div>
          <p className="text-evo-muted text-xs leading-relaxed">
            Member since {p.memberSince}. Your profile is active and visible to EVO's matching engine.
          </p>
        </div>

        {/* Settings menu */}
        <div className="bg-white rounded-[20px] border-[1.5px] border-evo-border px-4 mb-5"
          style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 12px' }}>
          <MenuItem icon={Bell} label="Notifications" sublabel="Lead alerts, briefs, payments" />
          <MenuItem icon={Shield} label="Account & Security" sublabel="Password, 2FA, linked email" />
          <MenuItem icon={HelpCircle} label="Help & Support" sublabel="FAQs, contact EVO team" />
          <MenuItem icon={LogOut} label="Sign Out" danger />
        </div>

        <p className="text-center text-evo-muted text-xs">EVO Supplier Platform · v1.0</p>
      </div>
    </div>
  )
}
