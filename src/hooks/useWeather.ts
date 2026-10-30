import { useCallback, useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage'

export interface WeatherData {
  temp: number
  high: number
  low: number
  code: number
  isDay: boolean
  unit: 'C' | 'F'
  fetchedAt: number
}

export type WeatherState =
  | { status: 'off' }
  | { status: 'locating' }
  | { status: 'loading' }
  | { status: 'ready'; data: WeatherData }
  | { status: 'denied' }
  | { status: 'error' }

// Open-Meteo's free API is for non-commercial use only, with attribution (CC BY 4.0).
// If Claire is ever monetized (ads, paid features, sponsorship), move to a paid
// Open-Meteo plan (https://open-meteo.com/en/pricing) and update the legal pages.
const CACHE_KEY = 'weather'
const TTL = 30 * 60 * 1000

function preferredUnit(): 'C' | 'F' {
  return /-(US|LR|MM)\b/i.test(navigator.language) ? 'F' : 'C'
}

function locate(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15_000,
      maximumAge: 10 * 60 * 1000,
    }),
  )
}

async function fetchWeather(lat: number, lon: number, unit: 'C' | 'F'): Promise<WeatherData> {
  const params = new URLSearchParams({
    // Rounded to ~1 km: plenty for weather, and keeps the location approximate.
    latitude: lat.toFixed(2),
    longitude: lon.toFixed(2),
    current: 'temperature_2m,weather_code,is_day',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '1',
  })
  if (unit === 'F') params.set('temperature_unit', 'fahrenheit')
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  const json = await res.json()
  return {
    temp: Math.round(json.current.temperature_2m),
    high: Math.round(json.daily.temperature_2m_max[0]),
    low: Math.round(json.daily.temperature_2m_min[0]),
    code: json.current.weather_code,
    isDay: json.current.is_day === 1,
    unit,
    fetchedAt: Date.now(),
  }
}

/** Opt-in weather: nothing touches geolocation until `request()` is called from a tap. */
export function useWeather() {
  const [state, setState] = useState<WeatherState>(() => {
    const cached = readJSON<WeatherData | null>(CACHE_KEY, null)
    return cached ? { status: 'ready', data: cached } : { status: 'off' }
  })

  const request = useCallback(async () => {
    if (!('geolocation' in navigator)) return setState({ status: 'error' })
    setState((s) => (s.status === 'ready' ? s : { status: 'locating' }))
    try {
      const pos = await locate()
      setState((s) => (s.status === 'ready' ? s : { status: 'loading' }))
      const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude, preferredUnit())
      writeJSON(CACHE_KEY, data)
      setState({ status: 'ready', data })
    } catch (err) {
      const denied = (err as GeolocationPositionError).code === 1
      // Keep showing stale data if a background refresh fails.
      setState((s) => (s.status === 'ready' && !denied ? s : { status: denied ? 'denied' : 'error' }))
    }
  }, [])

  // The user opted in before: refresh stale data, but only if it won't trigger a prompt.
  const fetchedAt = state.status === 'ready' ? state.data.fetchedAt : null
  useEffect(() => {
    if (fetchedAt === null || Date.now() - fetchedAt < TTL) return
    let cancelled = false
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((p) => {
        if (!cancelled && p.state === 'granted') void request()
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [fetchedAt, request])

  return { state, request }
}

export type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm'

/** WMO weather interpretation codes, as used by Open-Meteo. */
export function describeWeather(code: number): { kind: WeatherKind; label: string } {
  if (code === 0) return { kind: 'clear', label: 'Clear' }
  if (code <= 2) return { kind: 'partly', label: code === 1 ? 'Mostly clear' : 'Partly cloudy' }
  if (code === 3) return { kind: 'cloudy', label: 'Overcast' }
  if (code === 45 || code === 48) return { kind: 'fog', label: 'Fog' }
  if (code >= 51 && code <= 57) return { kind: 'drizzle', label: 'Drizzle' }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { kind: 'rain', label: code >= 80 ? 'Showers' : 'Rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { kind: 'snow', label: 'Snow' }
  if (code >= 95) return { kind: 'storm', label: 'Thunderstorm' }
  return { kind: 'cloudy', label: 'Cloudy' }
}
