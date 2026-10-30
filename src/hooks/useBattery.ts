import { useEffect, useState } from 'react'

interface BatteryManager extends EventTarget {
  level: number
  charging: boolean
}
type NavigatorWithBattery = Navigator & { getBattery?: () => Promise<BatteryManager> }

export interface BatteryInfo {
  level: number
  charging: boolean
}

/** Battery Status API (Chromium only). Returns null when unsupported, e.g. on iOS. */
export function useBattery(): BatteryInfo | null {
  const [info, setInfo] = useState<BatteryInfo | null>(null)

  useEffect(() => {
    const getBattery = (navigator as NavigatorWithBattery).getBattery
    if (!getBattery) return
    let battery: BatteryManager | null = null
    let cancelled = false
    const update = () => battery && setInfo({ level: battery.level, charging: battery.charging })

    getBattery
      .call(navigator)
      .then((b) => {
        if (cancelled) return
        battery = b
        update()
        b.addEventListener('levelchange', update)
        b.addEventListener('chargingchange', update)
      })
      .catch(() => {})

    return () => {
      cancelled = true
      battery?.removeEventListener('levelchange', update)
      battery?.removeEventListener('chargingchange', update)
    }
  }, [])

  return info
}
