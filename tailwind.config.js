export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Warm Premium Palette ────────────────────────────────
        'evo-bg':           '#F5F0E8',   // warm cream
        'evo-outer':        '#EDE8DF',   // secondary background
        'evo-card':         '#FDFAF5',   // card background
        'evo-elevated':     '#F0EBE1',   // elevated surface
        'evo-border':       '#E5DDD0',   // warm border
        'evo-accent':       '#6B5FE4',   // soft purple (primary)
        'evo-muted':        '#7A6E5F',   // warm taupe
        'evo-dim':          '#C8BFB0',   // warm dim
        'evo-text':         '#2C2016',   // deep warm brown
        'evo-purple':       '#3D2B7A',   // deep purple
        'evo-purple-mid':   '#6B5FE4',   // mid purple (= accent)
        'evo-purple-light': '#8B7AE8',   // light purple
        'evo-green':        '#4A9E72',   // sage green
        'evo-red':          '#D4607A',   // muted rose
        'evo-pink':         '#F2C49B',   // soft peach
        'evo-gold':         '#E8B86D',   // muted gold
        'evo-amber':        '#E8A030',   // warm amber
        // Legacy compat aliases
        'evo-black':        '#F5F0E8',
        'evo-surface':      '#FDFAF5',
      },
      fontFamily: {
        sans:   ['Heebo', 'Poppins', 'system-ui', 'sans-serif'],
        heebo:  ['Heebo', 'system-ui', 'sans-serif'],
        poppins:['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card':   '24px',
        'pill':   '9999px',
        'input':  '16px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(44, 32, 22, 0.08)',
        'card-hover': '0 8px 32px rgba(44, 32, 22, 0.14)',
        'cta':  '0 4px 20px rgba(107, 95, 228, 0.35)',
      },
      letterSpacing: {
        widest: '0.2em',
      },
    },
  },
  plugins: [],
}
