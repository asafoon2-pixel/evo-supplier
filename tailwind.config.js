export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'evo-black': '#0A0A0A',
        'evo-surface': '#141414',
        'evo-card': '#1A1A1A',
        'evo-elevated': '#222222',
        'evo-border': '#2A2A2A',
        'evo-accent': '#C9A96E',
        'evo-muted': '#888888',
        'evo-dim': '#444444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
      },
    },
  },
  plugins: [],
}
