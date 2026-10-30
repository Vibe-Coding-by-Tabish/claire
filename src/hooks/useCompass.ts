import { useCallback, useEffect, useRef, useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage'

export type CompassStatus = 'off' | 'requesting' | 'active' | 'denied' | 'unsupported' | 'no-sensor'

type OrientationEventWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number }
type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> }

const OPT_IN_KEY = 'compass'

const supported = () => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
const needsPermission = () => supported() && typeof (DeviceOrientationEvent as OrientationCtor).requestPermission === 'function'

function screenAngle(): number {
  const angle = screen.orientation?.angle ?? (window as Window & { orientation?: number }).orientation ?? 0
  return Number(angle) || 0
}

/** Compass heading in degrees (0 = north) for the top edge of the screen. */
function headingFrom(e: OrientationEventWithCompass): number | null {
  let raw: number | null = null
  if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
    raw = e.webkitCompassHeading // iOS: already clockwise from north
  } else if (e.absolute && e.alpha !== null) {
    raw = 360 - e.alpha // alpha is counter-clockwise
  }
  if (raw === null) return null
  return (((raw + screenAngle()) % 360) + 360) % 360
}

export function useCompass() {
  // Android needs no prompt, so a previous opt-in can resume immediately.
  const [status, setStatus] = useState<CompassStatus>(() =>
    readJSON(OPT_IN_KEY, false) && supported() && !needsPermission() ? 'active' : 'off',
  )
  const [heading, setHeading] = useState<number | null>(null)
  const latest = useRef<number | null>(null)

  const enable = useCallback(async () => {
    if (!supported()) return setStatus('unsupported')
    const ctor = DeviceOrientationEvent as OrientationCtor
    if (ctor.requestPermission) {
      setStatus('requesting')
      try {
        if ((await ctor.requestPermission()) !== 'granted') return setStatus('denied')
      } catch {
        return setStatus('denied')
      }
    }
    writeJSON(OPT_IN_KEY, true)
    setStatus('active')
  }, [])

  useEffect(() => {
    if (status !== 'active') return
    let frame = 0
    const onOrientation = (e: Event) => {
      const h = headingFrom(e as OrientationEventWithCompass)
      if (h === null) return
      latest.current = h
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          setHeading(latest.current)
        })
      }
    }
    const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation'
    window.addEventListener(eventName, onOrientation)
    const timeout = window.setTimeout(() => {
      if (latest.current === null) setStatus('no-sensor')
    }, 3000)
    return () => {
      window.removeEventListener(eventName, onOrientation)
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
    }
  }, [status])

  return { status, heading, enable }
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
export const cardinal = (deg: number) => CARDINALS[Math.round(deg / 45) % 8]
