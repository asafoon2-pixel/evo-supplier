import { motion } from 'framer-motion'
import { Handshake, CreditCard, Clock } from 'lucide-react'
import EvoLogo from '../components/EvoLogo'

export default function Payments() {
  return (
    <div className="w-full bg-evo-bg pb-8">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white border-b border-evo-border">
        <div className="mb-2"><EvoLogo height={20} variant="light" /></div>
        <h1 className="text-[22px] font-extrabold text-evo-text" style={{ letterSpacing: '-0.5px' }}>תשלומים</h1>
        <p className="text-evo-muted text-sm mt-1">בחר את אופן התשלום המתאים לך</p>
      </div>

      {/* Main info card */}
      {/* Option 1 — Direct */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-6 mt-8 bg-white rounded-[20px] border-[1.5px] border-evo-border p-6"
        style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 16px' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(108,77,217,0.1)' }}>
            <Handshake size={20} style={{ color: '#6C4DD9' }} />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-0.5" style={{ color: '#6C4DD9' }}>פעיל כעת</p>
            <p className="text-sm font-extrabold text-evo-text">תשלום ישיר מול הספק</p>
          </div>
        </div>
        <p className="text-evo-muted text-sm leading-relaxed">
          התשלום מתבצע ישירות בינך לבין הספק — במזומן, העברה בנקאית או כל דרך שתסכמו ביניכם. EVO מחבר בינכם ומנהל את התקשורת.
        </p>
      </motion.div>

      {/* Option 2 — EVO payments */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mx-6 mt-4 bg-white rounded-[20px] border-[1.5px] border-evo-border p-6 opacity-60"
        style={{ boxShadow: 'rgba(45,27,105,0.08) 0px 2px 16px' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(108,77,217,0.08)' }}>
            <CreditCard size={20} style={{ color: '#6C4DD9' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Clock size={11} style={{ color: '#6C4DD9' }} />
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: '#6C4DD9' }}>בקרוב</p>
            </div>
            <p className="text-sm font-extrabold text-evo-text">תשלום דרך EVO</p>
          </div>
        </div>
        <p className="text-evo-muted text-sm leading-relaxed">
          קבל תשלומים ישירות דרך הפלטפורמה — מקדמות, תשלומים סופיים וניהול חשבוניות, הכל במקום אחד.
        </p>
      </motion.div>
    </div>
  )
}
