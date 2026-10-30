import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readJSON, writeJSON } from '../lib/storage'

export interface Settings {
  lensScale: number
  blur: number
  use24h: boolean
  widgets: { weather: boolean; battery: boolean; compass: boolean; notes: boolean }
}

export const LENS_MIN = 1
export const LENS_MAX = 2
export const BLUR_MIN = 0
export const BLUR_MAX = 40

function defaultUse24h(): boolean {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hourCycle?.startsWith('h2') ?? false
  } catch {
    return false
  }
}

export const DEFAULT_SETTINGS: Settings = {
  lensScale: 1.4,
  blur: 22,
  use24h: defaultUse24h(),
  widgets: { weather: true, battery: true, compass: true, notes: true },
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function load(): Settings {
  const saved = readJSON<Partial<Settings>>('settings', {})
  return {
    lensScale: clamp(Number(saved.lensScale ?? DEFAULT_SETTINGS.lensScale), LENS_MIN, LENS_MAX),
    blur: clamp(Number(saved.blur ?? DEFAULT_SETTINGS.blur), BLUR_MIN, BLUR_MAX),
    use24h: typeof saved.use24h === 'boolean' ? saved.use24h : DEFAULT_SETTINGS.use24h,
    widgets: { ...DEFAULT_SETTINGS.widgets, ...saved.widgets },
  }
}

interface SettingsContextValue {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  setWidget: (key: keyof Settings['widgets'], on: boolean) => void
  reset: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)

  useEffect(() => {
    writeJSON('settings', settings)
    document.documentElement.style.setProperty('--glass-blur', `${settings.blur}px`)
  }, [settings])

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), [])
  const setWidget = useCallback(
    (key: keyof Settings['widgets'], on: boolean) =>
      setSettings((s) => ({ ...s, widgets: { ...s.widgets, [key]: on } })),
    [],
  )
  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  const value = useMemo(() => ({ settings, update, setWidget, reset }), [settings, update, setWidget, reset])
  return createElement(SettingsContext.Provider, { value }, children)
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
