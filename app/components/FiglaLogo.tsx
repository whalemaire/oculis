interface FiglaLogoProps {
  size?: number
  variant?: 'default' | 'inv'
  showWordmark?: boolean
  className?: string
}

export function FiglaLogo({ size = 28, variant = 'default', showWordmark = true, className = '' }: FiglaLogoProps) {
  const barColor = variant === 'inv' ? '#ffffff' : '#0A2540'
  const wordColor = variant === 'inv' ? '#ffffff' : '#0A2540'
  const gap = Math.round(size * 0.36)
  const wordSize = Math.round(size * 0.68)

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }} className={className}>
      <span style={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'block' }}>
        <span style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '21.25%', background: barColor, borderRadius: 999 }} />
        <span style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '21.25%', background: barColor, borderRadius: 999 }} />
        <span style={{
          position: 'absolute',
          width: '32.5%', height: '32.5%',
          left: '56.9%', top: '63.1%',
          transform: 'translate(-50%, -50%)',
          background: '#5B8CFF',
          borderRadius: '50%',
        }} />
      </span>
      {showWordmark && (
        <span style={{ fontWeight: 800, letterSpacing: '-0.025em', fontSize: wordSize, color: wordColor, lineHeight: 1 }}>
          FIGLA
        </span>
      )}
    </span>
  )
}
