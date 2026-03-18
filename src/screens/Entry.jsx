import { motion } from 'framer-motion'
import { useSupplier } from '../context/SupplierContext'

const f = (delay) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: 'easeOut' } })

export default function Entry() {
  const { navigate } = useSupplier()
  return (
    <div className="relative w-full min-h-screen bg-evo-black flex flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1516997121675-4c2d1696aa90?auto=format&fit=crop&w=1200&q=80"
          alt="" className="w-full h-full object-cover opacity-20 scale-105 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-evo-black/50 via-evo-black/60 to-evo-black" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-8">
        <div className="pt-16 flex items-center gap-3">
          <span className="text-2xl font-light tracking-[0.3em] text-white">EVO</span>
          <div className="w-px h-5 bg-evo-border" />
          <span className="text-xs tracking-[0.2em] uppercase text-evo-muted">Partners</span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <motion.p {...f(0.2)} className="text-xs tracking-[0.3em] uppercase text-evo-accent mb-5">
            For Event Professionals
          </motion.p>
          <motion.h1 {...f(0.35)} className="text-4xl sm:text-5xl font-light text-white leading-tight mb-5">
            Run your event<br />business better.
          </motion.h1>
          <motion.p {...f(0.5)} className="text-evo-muted text-base font-light leading-relaxed max-w-xs">
            EVO brings you qualified leads, organised bookings, and a full operating system — replacing WhatsApp, Instagram, and the chaos.
          </motion.p>

          <motion.div {...f(0.65)} className="mt-10 grid grid-cols-3 gap-4">
            {[['Qualified', 'leads only'], ['Zero', 'admin chaos'], ['One', 'system for all']].map(([n, l]) => (
              <div key={n} className="bg-evo-card/50 border border-evo-border rounded-2xl p-4 text-center">
                <p className="text-evo-accent text-lg font-light">{n}</p>
                <p className="text-evo-muted text-xs mt-1 leading-tight">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div {...f(0.8)} className="pb-14 flex flex-col gap-3">
          <button onClick={() => navigate('onboarding')}
            className="w-full py-4 rounded-full bg-evo-accent text-black text-sm font-semibold tracking-widest uppercase hover:bg-evo-accent/90 transition-all active:scale-[0.98]">
            Apply to Join
          </button>
          <button onClick={() => navigate('home')}
            className="w-full py-4 rounded-full border border-evo-border text-evo-muted text-sm font-medium tracking-wide hover:border-evo-accent/40 hover:text-white transition-all">
            Sign In
          </button>
        </motion.div>
      </div>
    </div>
  )
}
