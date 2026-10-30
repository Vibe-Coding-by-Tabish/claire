import type { CSSProperties, ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  label?: string
}

/** Frosted glass surface. Becomes a button when `onClick` is given. */
export default function GlassCard({ children, className = '', style, onClick, label }: GlassCardProps) {
  const classes = `glass rounded-[28px] text-left text-white ${className}`
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={`${classes} pressable`} style={style}>
        {children}
      </button>
    )
  }
  return (
    <div className={classes} style={style} aria-label={label}>
      {children}
    </div>
  )
}
