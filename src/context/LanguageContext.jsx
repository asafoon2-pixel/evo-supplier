import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext({ lang: 'he', setLang: () => {} })

// Apply direction immediately (before first render)
function applyLang(l) {
  document.documentElement.dir  = l === 'he' ? 'rtl' : 'ltr'
  document.documentElement.lang = l
  document.body.style.fontFamily = l === 'he'
    ? "'Heebo', system-ui, sans-serif"
    : "'Poppins', system-ui, sans-serif"
}
applyLang(localStorage.getItem('evo-lang') || 'he')

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('evo-lang') || 'he')

  useEffect(() => {
    applyLang(lang)
    localStorage.setItem('evo-lang', lang)
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}

// ── Simple toggle component ────────────────────────────────
export function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-pill"
      style={{ background: '#F0EBE1', border: '1.5px solid #E5DDD0' }}
    >
      {['he', 'en'].map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-3 py-1 rounded-pill text-[11px] font-bold transition-all"
          style={{
            background: lang === l ? '#6B5FE4' : 'transparent',
            color:      lang === l ? '#fff'    : '#7A6E5F',
            borderRadius: 9999,
          }}
        >
          {l === 'he' ? 'עב' : 'EN'}
        </button>
      ))}
    </div>
  )
}
