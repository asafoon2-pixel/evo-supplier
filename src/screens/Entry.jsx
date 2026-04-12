import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup,
} from 'firebase/auth'
import { auth } from '../firebase'
import { useSupplier } from '../context/SupplierContext'

const googleProvider = new GoogleAuthProvider()

const f = (delay) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
})

const PILLS = [
  { icon: '📦', label: 'ניהול חבילות' },
  { icon: '📅', label: 'מעקב הזמנות' },
  { icon: '💰', label: 'קבלת תשלומים' },
  { icon: '⭐', label: 'בניית ביקורות' },
]

function translateError(code) {
  switch (code) {
    case 'auth/email-already-in-use':   return 'כתובת האימייל כבר בשימוש'
    case 'auth/invalid-email':          return 'כתובת אימייל לא תקינה'
    case 'auth/weak-password':          return 'הסיסמה חלשה מדי — לפחות 6 תווים'
    case 'auth/user-not-found':         return 'המשתמש לא נמצא'
    case 'auth/wrong-password':         return 'סיסמה שגויה'
    case 'auth/invalid-credential':     return 'פרטי ההתחברות שגויים'
    case 'auth/too-many-requests':      return 'יותר מדי ניסיונות — נסה שוב מאוחר יותר'
    default:                            return 'שגיאה — נסה שנית'
  }
}

// ── Google button ─────────────────────────────────────────────
function GoogleButton({ onError }) {
  const { navigate, loadSupplierData } = useSupplier()
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    onError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      const hasDoc = await loadSupplierData(cred.user.uid)
      navigate(hasDoc ? 'home' : 'onboarding')
    } catch (err) {
      console.error('Google login error:', err)
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        onError(translateError(err.code))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-[1.5px] border-evo-border rounded-xl text-[15px] font-semibold text-evo-text transition-all active:scale-[0.98] disabled:opacity-60"
      style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-evo-border border-t-evo-purple rounded-full animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
      )}
      המשך עם Google
    </button>
  )
}

// ── Divider ───────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-evo-border" />
      <span className="text-xs text-evo-dim font-medium">או המשך עם אימייל</span>
      <div className="flex-1 h-px bg-evo-border" />
    </div>
  )
}

// ── Shared form fields ────────────────────────────────────────
function AuthForm({ isLogin, email, setEmail, password, setPassword, showPass, setShowPass, loading, error, onSubmit, onSwitch }) {
  return (
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
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            className="w-full bg-white border-[1.5px] border-evo-border rounded-xl px-4 py-3.5 pr-12 text-evo-text text-[15px] placeholder-evo-dim focus:outline-none focus:border-evo-purple-mid transition-colors"
          />
          <button type="button" onClick={() => setShowPass(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-evo-muted p-1">
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
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-4 text-white text-base font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ borderRadius: 14, background: isLogin ? '#2D1B8A' : 'linear-gradient(135deg, #2D1B8A, #6C5CE7)', boxShadow: '0 4px 20px rgba(45,27,105,0.35)' }}
      >
        {loading ? 'טוען...' : isLogin ? 'כניסה לחשבון' : 'יצירת חשבון חינם'}
        {!loading && <ArrowRight size={16} />}
      </button>

      {/* Switch mode */}
      <button onClick={onSwitch} className="text-center py-1">
        <span className="text-evo-muted text-sm">{isLogin ? 'עדיין לא רשום? ' : 'כבר יש לך חשבון? '}</span>
        <span className="text-evo-purple-mid text-sm font-bold">{isLogin ? 'הצטרף עכשיו ›' : 'כניסה ›'}</span>
      </button>
    </motion.div>
  )
}

// ── Login screen ──────────────────────────────────────────────
function LoginScreen({ onSwitch, onBack, email, setEmail, password, setPassword, showPass, setShowPass }) {
  const { navigate, loadSupplierData } = useSupplier()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleLogin = async () => {
    setError('')
    if (!email || !password) { setError('נא למלא אימייל וסיסמה'); return }
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
      if (cred.user) {
        const hasDoc = await loadSupplierData(cred.user.uid)
        navigate(hasDoc ? 'home' : 'onboarding')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(translateError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-evo-bg">
      {/* Header strip */}
      <div className="px-6 pt-10 pb-8">
        <motion.div {...f(0.05)} className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center"
            style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(145deg, #2D1B8A, #1E1060)', boxShadow: '0 4px 16px rgba(45,27,105,0.35)' }}>
            <span className="text-white text-sm font-extrabold tracking-tight">EVO</span>
          </div>
          <button onClick={onBack} className="mr-auto text-evo-muted text-sm font-medium">חזרה</button>
        </motion.div>

        <motion.div {...f(0.1)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
          style={{ background: 'rgba(45,27,105,0.08)', border: '1px solid rgba(45,27,105,0.15)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-evo-green" />
          <span className="text-xs font-bold text-evo-purple">כניסה לחשבון קיים</span>
        </motion.div>

        <motion.h1 {...f(0.15)} className="text-[28px] font-extrabold text-evo-text leading-tight mb-1" style={{ letterSpacing: '-0.5px' }}>
          ברוך השב! 👋
        </motion.h1>
        <motion.p {...f(0.2)} className="text-sm text-evo-muted font-medium">
          הכנס את פרטיך כדי להיכנס לחשבון הספק שלך
        </motion.p>
      </div>

      <div className="px-6 pb-10 flex-1 flex flex-col gap-4">
        <GoogleButton onError={setError} />
        <Divider />
        <AuthForm
          isLogin
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          showPass={showPass} setShowPass={setShowPass}
          loading={loading} error={error}
          onSubmit={handleLogin}
          onSwitch={onSwitch}
        />
      </div>
    </div>
  )
}

// ── Register screen ───────────────────────────────────────────
function RegisterScreen({ onSwitch, onBack, email, setEmail, password, setPassword, showPass, setShowPass }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleRegister = async () => {
    setError('')
    if (!email || !password) { setError('נא למלא אימייל וסיסמה'); return }
    if (password.length < 6)  { setError('הסיסמה חלשה מדי — לפחות 6 תווים'); return }
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password)
      // onAuthStateChanged → no vendor doc → onboarding
    } catch (err) {
      console.error('Register error:', err)
      setError(translateError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-evo-bg">
      {/* Header strip */}
      <div className="px-6 pt-10 pb-8">
        <motion.div {...f(0.05)} className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center"
            style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(145deg, #2D1B8A, #1E1060)', boxShadow: '0 4px 16px rgba(45,27,105,0.35)' }}>
            <span className="text-white text-sm font-extrabold tracking-tight">EVO</span>
          </div>
          <button onClick={onBack} className="mr-auto text-evo-muted text-sm font-medium">חזרה</button>
        </motion.div>

        <motion.div {...f(0.1)} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
          style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)' }}>
          <span className="text-xs font-extrabold" style={{ color: '#6C5CE7' }}>✦ הצטרפות חינמית</span>
        </motion.div>

        <motion.h1 {...f(0.15)} className="text-[28px] font-extrabold text-evo-text leading-tight mb-1" style={{ letterSpacing: '-0.5px' }}>
          הצטרף לEVO<br />כספק מוביל ✦
        </motion.h1>
        <motion.p {...f(0.2)} className="text-sm text-evo-muted font-medium leading-relaxed">
          צור חשבון ספק, הגדר את השירותים שלך<br />וקבל לידים ממנוע ההתאמה החכם של EVO
        </motion.p>
      </div>

      <div className="px-6 pb-10 flex-1 flex flex-col gap-4">
        <GoogleButton onError={setError} />
        <Divider />
        <AuthForm
          isLogin={false}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          showPass={showPass} setShowPass={setShowPass}
          loading={loading} error={error}
          onSubmit={handleRegister}
          onSwitch={onSwitch}
        />
      </div>
    </div>
  )
}

// ── Landing ───────────────────────────────────────────────────
export default function Entry() {
  const [mode, setMode]         = useState('landing')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const resetAndGo = (m) => { setEmail(''); setPassword(''); setShowPass(false); setMode(m) }
  const goBack     = () => setMode('landing')

  if (mode === 'login') {
    return <LoginScreen
      onSwitch={() => setMode('register')} onBack={goBack}
      email={email} setEmail={setEmail}
      password={password} setPassword={setPassword}
      showPass={showPass} setShowPass={setShowPass}
    />
  }

  if (mode === 'register') {
    return <RegisterScreen
      onSwitch={() => setMode('login')} onBack={goBack}
      email={email} setEmail={setEmail}
      password={password} setPassword={setPassword}
      showPass={showPass} setShowPass={setShowPass}
    />
  }

  // Landing
  return (
    <div className="flex flex-col min-h-screen px-6 pb-10 bg-evo-bg">
      {/* Logo */}
      <div className="flex flex-col items-center pt-10 pb-8">
        <motion.div {...f(0.1)} className="relative mb-8">
          <div className="absolute rounded-[44px] animate-pulse-glow" style={{ inset: '-18px', background: 'rgba(108,92,231,0.08)' }} />
          <div className="absolute rounded-[54px] animate-pulse-glow" style={{ inset: '-32px', background: 'rgba(108,92,231,0.04)', animationDelay: '0.7s' }} />
          <div className="relative flex items-center justify-center"
            style={{ width: 130, height: 130, borderRadius: 30, background: 'linear-gradient(145deg, #2D1B8A, #1E1060)', boxShadow: '0 12px 40px rgba(45,27,105,0.45)' }}>
            <span className="text-white text-4xl font-extrabold tracking-tight">EVO</span>
          </div>
        </motion.div>

        <motion.h1 {...f(0.2)} className="text-[28px] font-extrabold text-evo-text text-center leading-tight mb-2" style={{ letterSpacing: '-0.5px' }}>
          הגדל את העסק שלך<br />עם EVO
        </motion.h1>
        <motion.p {...f(0.3)} className="text-sm font-semibold text-evo-muted text-center leading-relaxed">
          הצטרף לפלטפורמה החכמה ביותר<br />לספקי אירועים בישראל
        </motion.p>
      </div>

      {/* Feature pills */}
      <motion.div {...f(0.45)} className="flex flex-wrap gap-2.5 justify-center mb-10">
        {PILLS.map(({ icon, label }) => (
          <span key={label}
            className="flex items-center gap-2 px-4 py-2 bg-evo-elevated border-[1.5px] border-evo-dim text-evo-purple text-sm font-semibold"
            style={{ borderRadius: 50 }}>
            <span>{icon}</span>
            <span>{label}</span>
          </span>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div {...f(0.55)} className="mt-auto flex flex-col gap-3">
        {/* Register — primary */}
        <button
          onClick={() => resetAndGo('register')}
          className="w-full py-4 text-white text-base font-bold tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ borderRadius: 14, background: 'linear-gradient(135deg, #2D1B8A, #6C5CE7)', boxShadow: '0 4px 20px rgba(45,27,105,0.35)' }}
        >
          <span>✦</span>
          <span>הצטרף כספק — חינם</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-evo-border" />
          <span className="text-xs text-evo-dim font-medium">או</span>
          <div className="flex-1 h-px bg-evo-border" />
        </div>

        {/* Login — secondary */}
        <button
          onClick={() => resetAndGo('login')}
          className="w-full py-3.5 text-evo-purple-mid text-base font-bold transition-all active:scale-[0.98] border-2 border-evo-purple-mid bg-transparent"
          style={{ borderRadius: 14 }}
        >
          כבר יש לי חשבון — כניסה
        </button>
      </motion.div>
    </div>
  )
}
