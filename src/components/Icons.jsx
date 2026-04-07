// ── Custom illustrated tab bar icons ──────────────────────
// Style: rounded line art, 2px stroke, warm brown + accent fills

export function IconHome({ active, size = 24 }) {
  const c = active ? '#6B5FE4' : '#7A6E5F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Storefront / clipboard */}
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"
        stroke={c} strokeWidth="2" strokeLinejoin="round"
        fill={active ? 'rgba(107,95,228,0.12)' : 'none'}/>
      <rect x="9" y="14" width="6" height="7" rx="1"
        stroke={c} strokeWidth="1.8" fill={active ? 'rgba(107,95,228,0.2)' : 'none'}/>
      {/* Small star accent */}
      {active && <circle cx="19" cy="5" r="2" fill="#E8B86D"/>}
    </svg>
  )
}

export function IconCalendar({ active, size = 24 }) {
  const c = active ? '#6B5FE4' : '#7A6E5F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="3"
        stroke={c} strokeWidth="2"
        fill={active ? 'rgba(107,95,228,0.1)' : 'none'}/>
      <path d="M8 3v4M16 3v4" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 10h18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Checkmark on day */}
      <path d="M9 15l2 2 4-4" stroke={active ? '#4A9E72' : c}
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconEvents({ active, size = 24 }) {
  const c = active ? '#6B5FE4' : '#7A6E5F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Gift box */}
      <rect x="3" y="10" width="18" height="11" rx="2"
        stroke={c} strokeWidth="2"
        fill={active ? 'rgba(107,95,228,0.1)' : 'none'}/>
      <path d="M3 10h18v3H3z" fill={active ? 'rgba(107,95,228,0.2)' : 'none'} stroke={c} strokeWidth="2"/>
      <path d="M12 10V21" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Bow */}
      <path d="M12 10 Q9 6 7 8 Q6 10 12 10" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M12 10 Q15 6 17 8 Q18 10 12 10" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Sparkle */}
      {active && (
        <>
          <circle cx="19" cy="5" r="1.2" fill="#E8B86D"/>
          <circle cx="21" cy="8" r="0.8" fill="#4A9E72"/>
        </>
      )}
    </svg>
  )
}

export function IconCatalog({ active, size = 24 }) {
  const c = active ? '#6B5FE4' : '#7A6E5F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Portfolio folder / tag */}
      <path d="M4 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
        stroke={c} strokeWidth="2"
        fill={active ? 'rgba(107,95,228,0.1)' : 'none'}/>
      {/* Lines inside */}
      <path d="M8 12h8M8 15h5" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.8"/>
      {/* Price tag dot */}
      {active && <circle cx="16" cy="9" r="1.5" fill="#E8A030"/>}
    </svg>
  )
}

export function IconProfile({ active, size = 24 }) {
  const c = active ? '#6B5FE4' : '#7A6E5F'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Person silhouette */}
      <circle cx="12" cy="8" r="4"
        stroke={c} strokeWidth="2"
        fill={active ? 'rgba(107,95,228,0.15)' : 'none'}/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={c} strokeWidth="2" strokeLinecap="round"
        fill={active ? 'rgba(107,95,228,0.08)' : 'none'}/>
      {/* Crown */}
      {active && (
        <path d="M9 5 L10.5 3 L12 4.5 L13.5 3 L15 5"
          stroke="#E8B86D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      )}
    </svg>
  )
}

// ── Status icons ──────────────────────────────────────────
export function IconConfirmed({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="rgba(74,158,114,0.15)" stroke="#4A9E72" strokeWidth="1.5"/>
      <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#4A9E72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 4 L14 5.5 L15.5 5" stroke="#E8B86D" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

export function IconPending({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="rgba(232,160,48,0.12)" stroke="#E8A030" strokeWidth="1.5"/>
      {/* Hourglass */}
      <path d="M7 5h6L10 10l3 5H7l3-5z" stroke="#E8A030" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <circle cx="10" cy="10" r="1" fill="#E8A030"/>
    </svg>
  )
}

export function IconCancelled({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="rgba(212,96,122,0.12)" stroke="#D4607A" strokeWidth="1.5"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke="#D4607A" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
