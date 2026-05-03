/**
 * EvoLogo — Official EVO brand logo (E + V wordmark + disco-ball O)
 * Props:
 *   height  — rendered height in px (width scales automatically), default 26
 *   dark    — true = white version (for dark backgrounds)
 *              false = color version: EV in pink, O in full gradient (for dark backgrounds)
 *              'light' = EV in indigo, O in gradient (for white backgrounds)
 */
export default function EvoLogo({ height = 26, dark = false, variant = 'color' }) {
  // Tight viewBox — content lives in roughly 80–1220 x 14–450
  const vb = '75 10 1150 445'
  const aspect = 1150 / 445
  const w = Math.round(height * aspect)

  const isWhite  = dark === true
  const isColor  = !isWhite   // color or 'light' both use gradient ball

  const evFill   = isWhite ? '#FFFFFF' : variant === 'light' ? '#1A0E4F' : '#F32A8C'

  // Unique IDs to avoid conflicts when multiple instances render
  const uid = `evo-${height}-${isWhite ? 'w' : 'c'}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={vb}
      width={w}
      height={height}
      role="img"
      aria-label="EVO"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {isColor && (
        <defs>
          <radialGradient id={`${uid}_base`} cx="35%" cy="30%" r="85%">
            <stop offset="0%"   stopColor="#FFC83D"/>
            <stop offset="35%"  stopColor="#FF7B3C"/>
            <stop offset="70%"  stopColor="#F32A8C"/>
            <stop offset="100%" stopColor="#7A1FB8"/>
          </radialGradient>
          <radialGradient id={`${uid}_glow`} cx="75%" cy="78%" r="55%">
            <stop offset="0%"   stopColor="#4DD0E1" stopOpacity="0.85"/>
            <stop offset="60%"  stopColor="#4DD0E1" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={`${uid}_spec`} cx="28%" cy="22%" r="22%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
          </radialGradient>
          <clipPath id={`${uid}_clip`}>
            <circle cx="1020" cy="250" r="200"/>
          </clipPath>
        </defs>
      )}

      {/* ── E ─────────────────────────────────── */}
      <path
        fill={evFill}
        d="M 80 70 L 320 70 L 320 145 L 160 145 L 160 212 L 280 212 L 280 288 L 160 288 L 160 355 L 320 355 L 320 430 L 80 430 Z"
      />

      {/* ── V ─────────────────────────────────── */}
      <path
        fill={evFill}
        d="M 420 70 L 507 70 L 570 222 L 633 70 L 720 70 L 570 430 Z"
      />

      {/* ── Disco-ball O ─────────────────────── */}
      {isColor ? (
        <>
          {/* Stem */}
          <line x1="1020" y1="14" x2="1020" y2="50" stroke="#FF7B3C" strokeWidth="7" strokeLinecap="round"/>
          {/* Sphere */}
          <circle cx="1020" cy="250" r="200" fill={`url(#${uid}_base)`}/>
          <circle cx="1020" cy="250" r="200" fill={`url(#${uid}_glow)`}/>
          {/* Grid */}
          <g clipPath={`url(#${uid}_clip)`} stroke="#1A0E4F" strokeWidth="3.5" strokeOpacity="0.85" strokeLinecap="square">
            <line x1="870"  y1="50"  x2="870"  y2="450"/>
            <line x1="920"  y1="50"  x2="920"  y2="450"/>
            <line x1="970"  y1="50"  x2="970"  y2="450"/>
            <line x1="1020" y1="50"  x2="1020" y2="450"/>
            <line x1="1070" y1="50"  x2="1070" y2="450"/>
            <line x1="1120" y1="50"  x2="1120" y2="450"/>
            <line x1="1170" y1="50"  x2="1170" y2="450"/>
            <line x1="820"  y1="100" x2="1220" y2="100"/>
            <line x1="820"  y1="150" x2="1220" y2="150"/>
            <line x1="820"  y1="200" x2="1220" y2="200"/>
            <line x1="820"  y1="250" x2="1220" y2="250"/>
            <line x1="820"  y1="300" x2="1220" y2="300"/>
            <line x1="820"  y1="350" x2="1220" y2="350"/>
            <line x1="820"  y1="400" x2="1220" y2="400"/>
          </g>
          {/* Specular */}
          <circle cx="1020" cy="250" r="200" fill={`url(#${uid}_spec)`}/>
        </>
      ) : (
        /* White outline version */
        <g fill="none" stroke="#FFFFFF" strokeLinecap="square">
          <line x1="1020" y1="14"  x2="1020" y2="50"  strokeWidth="6"/>
          <rect x="820"   y="50"   width="400" height="400" strokeWidth="6"/>
          <g strokeWidth="3.5">
            <line x1="870"  y1="50"  x2="870"  y2="450"/>
            <line x1="920"  y1="50"  x2="920"  y2="450"/>
            <line x1="970"  y1="50"  x2="970"  y2="450"/>
            <line x1="1020" y1="50"  x2="1020" y2="450"/>
            <line x1="1070" y1="50"  x2="1070" y2="450"/>
            <line x1="1120" y1="50"  x2="1120" y2="450"/>
            <line x1="1170" y1="50"  x2="1170" y2="450"/>
            <line x1="820"  y1="100" x2="1220" y2="100"/>
            <line x1="820"  y1="150" x2="1220" y2="150"/>
            <line x1="820"  y1="200" x2="1220" y2="200"/>
            <line x1="820"  y1="250" x2="1220" y2="250"/>
            <line x1="820"  y1="300" x2="1220" y2="300"/>
            <line x1="820"  y1="350" x2="1220" y2="350"/>
            <line x1="820"  y1="400" x2="1220" y2="400"/>
          </g>
          <circle cx="1020" cy="250" r="200" strokeWidth="6"/>
        </g>
      )}
    </svg>
  )
}
