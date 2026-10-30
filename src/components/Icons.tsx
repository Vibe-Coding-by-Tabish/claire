import type { SVGProps } from 'react'
import type { WeatherKind } from '../hooks/useWeather'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function TorchIcon({ on, ...p }: IconProps & { on?: boolean }) {
  return (
    <Svg {...p}>
      <path d="M8 3h8v3.5l-2 3V20a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9.5l-2-3z" fill={on ? 'currentColor' : 'none'} fillOpacity={0.25} />
      <path d="M8 6.5h8" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function SnapshotIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.5v4.5M20.1 9.4l-4.3 1.4M17 19l-2.6-3.7M7 19l2.6-3.7M3.9 9.4l4.3 1.4" strokeOpacity={0.55} />
    </Svg>
  )
}

export function ExpandIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
    </Svg>
  )
}

export function ShrinkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20" />
    </Svg>
  )
}

export function SlidersIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 7h9M18 7h1M5 17h1M10 17h9" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </Svg>
  )
}

export function CloseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  )
}

export function LinkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </Svg>
  )
}

export function CameraOffIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H7l1.5-2h5L15 6h4.5A1.5 1.5 0 0 1 21 7.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
      <path d="M4 3l16 18" />
    </Svg>
  )
}

export function DeviceIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
      <circle cx="12" cy="5.5" r="0.6" fill="currentColor" />
    </Svg>
  )
}

export function LocationIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10" r="2.3" />
    </Svg>
  )
}

export function CompassIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </Svg>
  )
}

export function BoltIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13 3L6 13h5l-1 8 7-10h-5z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function WeatherIcon({ kind, isDay = true, ...p }: IconProps & { kind: WeatherKind; isDay?: boolean }) {
  const cloud = <path d="M7 18.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6 1.3A3.4 3.4 0 0 1 17 18.5z" />
  const body = isDay ? (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" />
    </>
  ) : (
    <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />
  )
  switch (kind) {
    case 'clear':
      return <Svg {...p}>{body}</Svg>
    case 'partly':
      return (
        <Svg {...p}>
          {isDay ? (
            <>
              <circle cx="9" cy="8.5" r="3" />
              <path d="M9 3v1M3.5 8.5h1M5.1 4.6l.7.7M12.9 4.6l-.7.7" />
            </>
          ) : (
            <path d="M12.5 9.5A4.5 4.5 0 0 1 7 4a4.5 4.5 0 1 0 5.5 5.5z" />
          )}
          <path d="M8.5 20a3.5 3.5 0 0 1-.3-7 4.8 4.8 0 0 1 9.3 1.1A3 3 0 0 1 17 20z" />
        </Svg>
      )
    case 'cloudy':
      return <Svg {...p}>{cloud}</Svg>
    case 'fog':
      return (
        <Svg {...p}>
          <path d="M4 9h16M6 13h12M4 17h16" />
        </Svg>
      )
    case 'drizzle':
    case 'rain':
      return (
        <Svg {...p}>
          <path d="M7 15a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6 1.3A3.4 3.4 0 0 1 17 15z" />
          <path d={kind === 'rain' ? 'M8 18l-1 3M12 18l-1 3M16 18l-1 3' : 'M9 18.5v1M15 18.5v1M12 20v1'} />
        </Svg>
      )
    case 'snow':
      return (
        <Svg {...p}>
          <path d="M7 15a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6 1.3A3.4 3.4 0 0 1 17 15z" />
          <path d="M8 18.5h.01M12 20h.01M16 18.5h.01M10 21.5h.01M14 21.5h.01" strokeWidth={2.4} />
        </Svg>
      )
    case 'storm':
      return (
        <Svg {...p}>
          <path d="M7 15a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6 1.3A3.4 3.4 0 0 1 17 15z" />
          <path d="M12.5 14l-2 3.5h3l-2 3.5" />
        </Svg>
      )
  }
}
