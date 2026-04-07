import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
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

// Translate Firebase auth error codes to Hebrew
function translateError(code) {
  switch (code) {
    case 'auth/email-already-in-use':   return 'כתובת האימייל כבר בשימוש'
    case 'auth/invalid-email':          return 'כתובת אימייל לא תקינה'
    case 'auth/weak-password':          return 'הסיסמה חלשה מדי — לפחות 6 תווים'
    case 'auth/user-not-found':         return 'המשתמש לא נמצא'
    case 'auth/wrong-password':         return 'סיסמה שגויה'
    case 'auth/invalid-credential':     return 'פרטי ההתחברות שגויים'
    case 'auth/too-many-requests':      return 'יותר מדי ניסיונות — נסה שוב מאוחר יותר'
    default:                            return 'שגיאה בהתחברות — נסה שנית'
  }
}

export default function Entry() {
  const { navigate } = useSupplier()
  const [mode, setMode]             = useState('landing') // 'landing' | 'login' | 'register'
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleLogin = async () => {
    setError('')
    if (!email || !password) { setError('נא למלא אימייל וסיסמה'); return }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      // onAuthStateChanged in context will handle navigation
    } catch (err) {
      console.error('Login error:', err)
      setError(translateError(err.code) + ' (' + err.code + ')')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    if (!email || !password) { setError('נא למלא אימייל וסיסמה'); return }
    if (password.length < 6) { setError('הסיסמה חלשה מדי — לפחות 6 תווים'); return }
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password)
      // onAuthStateChanged in context: no supplier doc → navigate to onboarding
    } catch (err) {
      console.error('Register error:', err)
      setError(translateError(err.code) + ' (' + err.code + ')')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'login' || mode === 'register') {
    const isLogin = mode === 'login'
    return (
      <div className="flex flex-col min-h-screen px-6 pb-10 bg-evo-bg">
        <div className="flex flex-col items-center pt-10 pb-8">
          <motion.div {...f(0.05)} className="relative mb-6">
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'linear-gradient(145deg, #2D1B8A, #1E1060)',
                boxShadow: '0 8px 28px rgba(45,27,105,0.4)',
              }}
            >
              <span className="text-white text-2xl font-extrabold tracking-tight">EVO</span>
            </div>
          </motion.div>
          <motion.h1 {...f(0.1)} className="text-[24px] font-extrabold text-evo-text text-center mb-1" style={{ letterSpacing: '-0.5px' }}>
            {isLogin ? 'ברוך הבא בחזרה' : 'הצטרפות כספק'}
          </motion.h1>
          <motion.p {...f(0.15)} className="text-sm text-evo-muted text-center">
            {isLogin ? 'התחבר לחשבון EVO שלך' : 'צור חשבון חדש ונתחיל'}
          </motion.p>
        </div>

        <motion.div {...f(0.2)} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-evo-muted block mb-2 uppercase tracking-wider">סיסמה</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'לפחות 6 תווים'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                onKeyDown={e => e.key === 'Enter' && (isLogin ? handleLogin() : handleRegister())}
                className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 pr-12 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-evo-muted p-1"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm font-semibold text-red-500 text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTA */}
          <button
            onClick={isLogin ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full py-4 text-white text-base font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ borderRadius: 14, background: '#2D1B8A', boxShadow: '0 4px 20px rgba(45,27,105,0.35)' }}
          >
            {loading ? 'טוען...' : isLogin ? 'התחבר' : 'הצטרף לEVO'}
          </button>

          <button
            onClick={() => { setMode('landing'); setError('') }}
            className="text-evo-muted text-sm font-medium text-center py-1"
          >
            חזרה
          </button>
        </motion.div>
      </div>
    )
  }

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
          onClick={() => setMode('register')}
          className="w-full py-4 text-white text-base font-bold tracking-wide transition-all active:scale-[0.98]"
          style={{
            borderRadius: 14,
            background: '#2D1B8A',
            boxShadow: '0 4px 20px rgba(45,27,105,0.35)',
          }}
        >
          הצטרף כספק
        </button>
        <button
          onClick={() => setMode('login')}
          className="w-full py-4 text-evo-purple-mid text-base font-bold transition-all active:scale-[0.98] border-2 border-evo-purple-mid bg-transparent"
          style={{ borderRadius: 14 }}
        >
          יש לי כבר חשבון
        </button>
      </motion.div>
    </div>
  )
}
