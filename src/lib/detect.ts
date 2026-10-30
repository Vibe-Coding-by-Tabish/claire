const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent

export const isIOS =
  /iPad|iPhone|iPod/.test(ua) ||
  // iPadOS reports itself as a Mac.
  (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export const isAndroid = /Android/i.test(ua)
export const isSamsungInternet = /SamsungBrowser/i.test(ua)

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

const IN_APP: [RegExp, string][] = [
  [/Instagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, 'Facebook'],
  [/LinkedInApp/i, 'LinkedIn'],
  [/Twitter|TwitterAndroid|\bX\/\d/i, 'X'],
  [/\bLine\//i, 'LINE'],
  [/Snapchat/i, 'Snapchat'],
]

/** Name of the in-app browser we're running inside, or null for a real browser. */
export function detectInAppBrowser(): string | null {
  if (getSimulation() === 'inapp') return 'Instagram'
  for (const [re, name] of IN_APP) if (re.test(ua)) return name
  return null
}

export const SIMULATIONS = [
  'live',
  'denied',
  'in-use',
  'no-rear-camera',
  'insecure',
  'unsupported',
  'error',
  'inapp',
] as const
export type Simulation = (typeof SIMULATIONS)[number]

/** `?simulate=<state>` forces a fallback screen for testing. */
export function getSimulation(): Simulation | null {
  if (typeof location === 'undefined') return null
  const value = new URLSearchParams(location.search).get('simulate')
  return (SIMULATIONS as readonly string[]).includes(value ?? '') ? (value as Simulation) : null
}

/** The current URL without testing params, for sharing and QR codes. */
export function shareableUrl(): string {
  const url = new URL(location.href)
  url.searchParams.delete('simulate')
  url.hash = ''
  return url.toString()
}

type FullscreenDoc = Document & { webkitFullscreenEnabled?: boolean }
export function fullscreenSupported(): boolean {
  const doc = document as FullscreenDoc
  return Boolean(doc.fullscreenEnabled || doc.webkitFullscreenEnabled)
}
