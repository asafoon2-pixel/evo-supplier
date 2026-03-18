import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MapPin, Clock, Award, ChevronRight, Edit3, LogOut, Shield, Bell, HelpCircle } from 'lucide-react'
import { useSupplier } from '../context/SupplierContext'
import { supplierProfile, insights } from '../data/index'

function StatPill({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-white text-xl font-light">{value}</p>
      <p className="text-evo-dim text-xs mt-0.5">{label}</p>
    </div>
  )
}

function PortfolioGrid({ images }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {images.map((img, i) => (
        <div key={i} className={`overflow-hidden rounded-lg bg-evo-card ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
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
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/10' : 'bg-evo-elevated'}`}>
        <Icon size={16} className={danger ? 'text-red-400' : 'text-evo-muted'} />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-light ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
        {sublabel && <p className="text-evo-dim text-xs mt-0.5">{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={14} className="text-evo-dim" />}
    </button>
  )
}

export default function Profile() {
  const { navigate } = useSupplier()
  const p = supplierProfile

  return (
    <div className="w-full min-h-screen bg-evo-black pb-28">
      {/* Cover + Avatar */}
      <div className="relative h-48">
        <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-evo-black" />
        <button className="absolute top-12 right-5 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Edit3 size={14} className="text-white" />
        </button>
      </div>

      {/* Avatar + identity */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl border-2 border-evo-black overflow-hidden">
            <img src={p.avatar} alt={p.ownerName} className="w-full h-full object-cover" />
          </div>
          <div className="pb-1">
            <p className="text-xs tracking-[0.2em] uppercase text-evo-accent">{p.category}</p>
            <h1 className="text-xl font-light text-white leading-tight">{p.name}</h1>
            <p className="text-evo-muted text-sm">{p.ownerName}</p>
          </div>
        </div>

        {/* Rating & meta */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-evo-accent fill-evo-accent" />
            <span className="text-white text-sm font-medium">{p.rating}</span>
            <span className="text-evo-dim text-xs">({p.reviewCount})</span>
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
        <div className="bg-evo-card rounded-2xl border border-evo-border p-4 flex items-center justify-around mb-6">
          <StatPill label="Events" value={p.eventsCount} />
          <div className="w-px h-8 bg-evo-border" />
          <StatPill label="Acceptance" value={`${insights.acceptanceRate}%`} />
          <div className="w-px h-8 bg-evo-border" />
          <StatPill label="Avg Deal" value={`₪${(insights.avgDealSize / 1000).toFixed(1)}k`} />
        </div>

        {/* About */}
        <div className="mb-6">
          <p className="text-xs tracking-[0.25em] uppercase text-evo-muted mb-3">About</p>
          <p className="text-evo-muted text-sm leading-relaxed font-light">{p.description}</p>
        </div>

        {/* Service area & price range */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-evo-card rounded-xl border border-evo-border p-3">
            <p className="text-evo-dim text-xs mb-1">Service Area</p>
            <p className="text-white text-sm font-light">{p.serviceArea}</p>
          </div>
          <div className="bg-evo-card rounded-xl border border-evo-border p-3">
            <p className="text-evo-dim text-xs mb-1">Price Range</p>
            <p className="text-white text-sm font-light">{p.priceRange}</p>
          </div>
        </div>

        {/* Portfolio */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs tracking-[0.25em] uppercase text-evo-muted">Portfolio</p>
            <button className="text-evo-accent text-xs tracking-wide">Manage</button>
          </div>
          <PortfolioGrid images={p.portfolio} />
        </div>

        {/* EVO Status */}
        <div className="bg-evo-card rounded-2xl border-l-2 border-evo-accent p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-evo-accent" />
            <p className="text-xs tracking-[0.2em] uppercase text-evo-accent">EVO Verified</p>
          </div>
          <p className="text-evo-muted text-xs leading-relaxed font-light">
            Member since {p.memberSince}. Your profile is active and visible to EVO's matching engine.
          </p>
        </div>

        {/* Settings menu */}
        <div className="bg-evo-card rounded-2xl border border-evo-border px-4 mb-6">
          <MenuItem icon={Bell} label="Notifications" sublabel="Lead alerts, briefs, payments" />
          <MenuItem icon={Shield} label="Account & Security" sublabel="Password, 2FA, linked email" />
          <MenuItem icon={HelpCircle} label="Help & Support" sublabel="FAQs, contact EVO team" />
          <MenuItem icon={LogOut} label="Sign Out" danger />
        </div>

        <p className="text-center text-evo-dim text-xs">EVO Supplier Platform · v1.0</p>
      </div>
    </div>
  )
}
