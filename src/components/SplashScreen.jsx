import { motion } from 'framer-motion'

// ── Illustrated floating icons (inline SVG) ───────────────
const ICONS = [
  {
    id: 'camera',
    x: '12%', y: '18%',
    delay: 0.1,
    svg: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="3" y="10" width="30" height="20" rx="4" stroke="#6B5FE4" strokeWidth="2" fill="#FDFAF5"/>
        <circle cx="18" cy="20" r="6" stroke="#6B5FE4" strokeWidth="2" fill="#F0EBE1"/>
        <circle cx="18" cy="20" r="3" fill="#6B5FE4"/>
        <path d="M13 10 L15 6 H21 L23 10" stroke="#6B5FE4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="28" cy="14" r="2" fill="#6B5FE4"/>
      </svg>
    )
  },
  {
    id: 'music',
    x: '78%', y: '14%',
    delay: 0.2,
    svg: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M12 24V10l14-3v14" stroke="#4A9E72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="24" r="3" stroke="#4A9E72" strokeWidth="2" fill="#F0EBE1"/>
        <circle cx="23" cy="21" r="3" stroke="#4A9E72" strokeWidth="2" fill="#F0EBE1"/>
        <path d="M12 14l14-3" stroke="#4A9E72" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'star',
    x: '8%', y: '58%',
    delay: 0.35,
    svg: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 3 L17.5 11 H26 L19.5 16 L22 24 L15 19 L8 24 L10.5 16 L4 11 H12.5 Z"
          stroke="#E8B86D" strokeWidth="2" strokeLinejoin="round" fill="#F2C49B" fillOpacity="0.5"/>
      </svg>
    )
  },
  {
    id: 'mic',
    x: '82%', y: '55%',
    delay: 0.15,
    svg: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="11" y="3" width="10" height="16" rx="5" stroke="#6B5FE4" strokeWidth="2" fill="#F0EBE1"/>
        <path d="M6 17a10 10 0 0020 0" stroke="#6B5FE4" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M16 27v4M12 31h8" stroke="#6B5FE4" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 9h4M14 12h4M14 15h4" stroke="#6B5FE4" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    )
  },
  {
    id: 'sparkle',
    x: '20%', y: '75%',
    delay: 0.45,
    svg: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2 L15.5 12 L24 14 L15.5 15.5 L14 26 L12.5 15.5 L4 14 L12.5 12 Z"
          stroke="#E8A030" strokeWidth="2" strokeLinejoin="round" fill="#E8B86D" fillOpacity="0.4"/>
        <circle cx="22" cy="6" r="2" fill="#E8A030" opacity="0.7"/>
        <circle cx="6" cy="22" r="1.5" fill="#4A9E72" opacity="0.7"/>
      </svg>
    )
  },
  {
    id: 'chef',
    x: '72%', y: '78%',
    delay: 0.25,
    svg: (
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <ellipse cx="17" cy="12" rx="10" ry="8" stroke="#D4607A" strokeWidth="2" fill="#F0EBE1"/>
        <path d="M10 14 H24 V22 Q24 26 17 26 Q10 26 10 22 Z" stroke="#D4607A" strokeWidth="2" fill="#FDFAF5"/>
        <path d="M7 10 Q5 6 9 5 Q10 2 14 4" stroke="#D4607A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M27 10 Q29 6 25 5 Q24 2 20 4" stroke="#D4607A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M17 5 Q17 2 17 1" stroke="#D4607A" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 19h8M15 22h4" stroke="#D4607A" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'confetti',
    x: '45%', y: '8%',
    delay: 0.3,
    svg: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <rect x="4" y="12" width="6" height="6" rx="1" fill="#6B5FE4" transform="rotate(20 7 15)"/>
        <rect x="20" y="8" width="5" height="5" rx="1" fill="#4A9E72" transform="rotate(-15 22 10)"/>
        <circle cx="14" cy="22" r="3" fill="#E8B86D"/>
        <rect x="22" y="20" width="4" height="4" rx="1" fill="#D4607A" transform="rotate(30 24 22)"/>
        <circle cx="8" cy="8" r="2" fill="#F2C49B"/>
        <path d="M16 6 L17.5 9 L21 9 L18.5 11 L19.5 14 L16 12 L12.5 14 L13.5 11 L11 9 L14.5 9 Z"
          stroke="#E8A030" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  },
]

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#F5F0E8' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Floating illustrated icons */}
      {ICONS.map(({ id, x, y, delay, svg }) => (
        <motion.div
          key={id}
          className="absolute"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ delay: delay + 0.6, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {svg}
          </motion.div>
        </motion.div>
      ))}

      {/* Center logo */}
      <motion.div
        className="flex flex-col items-center gap-5"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo mark */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 120, height: 120,
            borderRadius: 32,
            background: 'linear-gradient(145deg, #6B5FE4, #3D2B7A)',
            boxShadow: '0 16px 48px rgba(107,95,228,0.4)',
          }}
        >
          <span className="text-white text-4xl font-black tracking-tight"
            style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-1px' }}>
            EVO
          </span>
        </div>

        {/* Tagline */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-sm font-semibold" style={{ color: '#7A6E5F', letterSpacing: '0.08em' }}>
            פלטפורמת ספקי האירועים
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
