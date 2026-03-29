export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy names remapped to new light design system
        'evo-black':    '#F5F5F7',
        'evo-surface':  '#FFFFFF',
        'evo-card':     '#FFFFFF',
        'evo-elevated': '#EEF0FF',
        'evo-border':   '#E8E8F0',
        'evo-accent':   '#6C5CE7',
        'evo-muted':    '#6B6B8A',
        'evo-dim':      '#C5B8F0',
        // New design system
        'evo-text':         '#1A1A2E',
        'evo-purple':       '#1E1060',
        'evo-purple-mid':   '#2D1B8A',
        'evo-purple-light': '#5B4BA8',
        'evo-pink':         '#FF2D8A',
        'evo-green':        '#00C48C',
        'evo-red':          '#FF3B5C',
        'evo-outer':        '#E0DFF5',
        'evo-bg':           '#F5F5F7',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
      },
    },
  },
  plugins: [],
}
