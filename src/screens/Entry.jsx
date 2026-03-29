import { motion } from 'framer-motion'
import { useSupplier } from '../context/SupplierContext'

const f = (delay) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
})

const PILLS = [
  { icon: '📦', label: 'Manage Packages' },
  { icon: '📅', label: 'Track Bookings' },
  { icon: '💰', label: 'Get Paid' },
  { icon: '⭐', label: 'Build Reviews' },
]

export default function Entry() {
  const { navigate } = useSupplier()

  return (
    <div className="flex flex-col min-h-screen px-6 pb-10 bg-evo-bg">

      {/* Logo */}
      <div className="flex flex-col items-center pt-10 pb-8">
        <motion.div {...f(0.1)} className="relative mb-8">
          <div
            className="absolute rounded-[44px] animate-pulse-glow"
            style={{ inset: '-18px', background: 'rgba(108,92,231,0.08)' }}
          />
          <div
            className="absolute rounded-[54px] animate-pulse-glow"
            style={{ inset: '-32px', background: 'rgba(108,92,231,0.04)', animationDelay: '0.7s' }}
          />
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 130,
              height: 130,
              borderRadius: 30,
              background: 'linear-gradient(145deg, #2D1B8A, #1E1060)',
              boxShadow: '0 12px 40px rgba(45,27,105,0.45)',
            }}
          >
            <span className="text-white text-4xl font-extrabold tracking-tight">EVO</span>
          </div>
        </motion.div>

        <motion.h1
          {...f(0.2)}
          className="text-[28px] font-extrabold text-evo-text text-center leading-tight mb-2"
          style={{ letterSpacing: '-0.5px' }}
        >
          Grow your business<br />with EVO
        </motion.h1>
        <motion.p {...f(0.3)} className="text-sm font-semibold text-evo-muted text-center leading-relaxed">
          Join Israel's smartest event<br />production marketplace
        </motion.p>
      </div>

      {/* Feature pills */}
      <motion.div {...f(0.45)} className="flex flex-wrap gap-2.5 justify-center mb-10">
        {PILLS.map(({ icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-2 px-4 py-2 bg-evo-elevated border-[1.5px] border-evo-dim text-evo-purple text-sm font-semibold"
            style={{ borderRadius: 50 }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </span>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div {...f(0.55)} className="mt-auto flex flex-col gap-3">
        <button
          onClick={() => navigate('onboarding')}
          className="w-full py-4 text-white text-base font-bold tracking-wide transition-all active:scale-[0.98]"
          style={{
            borderRadius: 14,
            background: '#2D1B8A',
            boxShadow: '0 4px 20px rgba(45,27,105,0.35)',
          }}
        >
          Join as a Supplier
        </button>
        <button
          onClick={() => navigate('home')}
          className="w-full py-4 text-evo-purple-mid text-base font-bold transition-all active:scale-[0.98] border-2 border-evo-purple-mid bg-transparent"
          style={{ borderRadius: 14 }}
        >
          I already have an account
        </button>
      </motion.div>
    </div>
  )
}
