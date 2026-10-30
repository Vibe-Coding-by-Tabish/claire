import { cardinal, useCompass } from '../../hooks/useCompass'
import GlassCard from '../GlassCard'
import { CompassIcon } from '../Icons'
import { WIDGET_CLASS } from './widgetStyles'

function Dial({ heading }: { heading: number }) {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {/* Fixed bezel; the brighter top tick marks where the screen is facing. */}
      {Array.from({ length: 24 }, (_, i) => (
        <line
          key={i}
          x1="50"
          y1="6"
          x2="50"
          y2={i === 0 ? 14 : i % 6 === 0 ? 12 : 10}
          stroke="white"
          strokeOpacity={i === 0 ? 1 : i % 6 === 0 ? 0.7 : 0.35}
          strokeWidth={i === 0 ? 2.4 : i % 6 === 0 ? 1.8 : 1.2}
          strokeLinecap="round"
          transform={`rotate(${i * 15} 50 50)`}
        />
      ))}
      {/* Needle: the red half always points north. */}
      <g style={{ transform: `rotate(${-heading}deg)`, transformOrigin: '50px 50px' }}>
        <path d="M50 22 L55 50 L45 50 Z" fill="#ff7a6b" />
        <path d="M50 78 L55 50 L45 50 Z" fill="white" fillOpacity="0.8" />
        <circle cx="50" cy="50" r="2.6" fill="white" />
      </g>
    </svg>
  )
}

export default function CompassWidget() {
  const { status, heading, enable } = useCompass()

  if (status === 'active' && heading !== null) {
    const deg = Math.round(heading) % 360
    return (
      <GlassCard className={`${WIDGET_CLASS} relative justify-end! overflow-hidden`} label={`Heading ${deg} degrees ${cardinal(deg)}`}>
        <Dial heading={heading} />
        <div className="relative text-center text-xs font-medium tabular-nums">
          {deg}° {cardinal(deg)}
        </div>
      </GlassCard>
    )
  }

  const message = {
    off: 'Tap for compass',
    requesting: 'Waiting…',
    active: 'Calibrating…',
    denied: 'Motion access denied. Tap to retry',
    unsupported: 'No compass here',
    'no-sensor': 'No compass sensor',
  }[status]
  const canTap = status === 'off' || status === 'denied'

  return (
    <GlassCard className={WIDGET_CLASS} onClick={canTap ? enable : undefined} label={message}>
      <CompassIcon size={24} className={status === 'active' ? 'animate-spin [animation-duration:3s]' : ''} />
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Compass</div>
        <div className="mt-1 text-[13px] leading-tight text-white/90">{message}</div>
      </div>
    </GlassCard>
  )
}
