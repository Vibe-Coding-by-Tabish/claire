import { useCallback, useEffect, useState, type RefObject } from 'react'
import { useBattery } from '../hooks/useBattery'
import { useSettings } from '../hooks/useSettings'
import { useTorch } from '../hooks/useTorch'
import { useWeather } from '../hooks/useWeather'
import { fullscreenSupported, isIOS, isStandalone } from '../lib/detect'
import { OPEN_METEO_URL } from '../lib/legal'
import { renderSnapshot, shareOrDownload, snapshotFile } from '../lib/snapshot'
import { readJSON, writeJSON } from '../lib/storage'
import Clock from './Clock'
import Dock from './Dock'
import Notes from './Notes'
import SettingsSheet from './SettingsSheet'
import SnapshotPreview from './SnapshotPreview'
import Toast, { type ToastMessage } from './Toast'
import BatteryWidget from './widgets/BatteryWidget'
import CompassWidget from './widgets/CompassWidget'
import WeatherWidget from './widgets/WeatherWidget'

interface HomeScreenProps {
  track: MediaStreamTrack | null
  videoRef: RefObject<HTMLVideoElement | null>
}

type FullscreenDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }
type FullscreenEl = HTMLElement & { webkitRequestFullscreen?: () => void }

const isFullscreen = () => Boolean(document.fullscreenElement || (document as FullscreenDoc).webkitFullscreenElement)

function useFullscreen(onUnsupported: () => void) {
  const supported = fullscreenSupported()
  const [active, setActive] = useState(isFullscreen)

  useEffect(() => {
    const onChange = () => setActive(isFullscreen())
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggle = useCallback(() => {
    if (!supported) return onUnsupported()
    const doc = document as FullscreenDoc
    if (isFullscreen()) {
      if (document.exitFullscreen) void document.exitFullscreen().catch(() => {})
      else doc.webkitExitFullscreen?.()
      return
    }
    const el = document.documentElement as FullscreenEl
    if (el.requestFullscreen) void el.requestFullscreen({ navigationUI: 'hide' }).catch(onUnsupported)
    else el.webkitRequestFullscreen?.()
  }, [supported, onUnsupported])

  // Installed iOS web apps are already full screen and can't toggle it.
  const visible = supported || !isStandalone()
  return { visible, active, toggle }
}

let toastId = 0

const SAFETY_KEY = 'safetyNoticeSeen'
const SAFETY_TOAST: ToastMessage = { id: -1, text: "Look up from Claire when you're on the move.", duration: 4000 }
/** Staggered entrance delay for the nth block. */
const rise = (step: number) => ({ animationDelay: `${90 + step * 90}ms` })

export default function HomeScreen({ track, videoRef }: HomeScreenProps) {
  const { settings } = useSettings()
  const battery = useBattery()
  const torch = useTorch(track)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const weather = useWeather()
  // One-time safety reminder on the very first launch; shown once the camera is live.
  const [toast, setToast] = useState<ToastMessage | null>(() => (readJSON(SAFETY_KEY, false) ? null : SAFETY_TOAST))
  const [snapshotBusy, setSnapshotBusy] = useState(false)
  const [flash, setFlash] = useState(0)
  const [pendingShare, setPendingShare] = useState<File | null>(null)

  const showToast = useCallback((text: string) => setToast({ id: ++toastId, text }), [])
  const clearToast = useCallback(() => setToast(null), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  useEffect(() => writeJSON(SAFETY_KEY, true), [])

  const fullscreen = useFullscreen(
    useCallback(
      () =>
        showToast(
          isIOS ? 'For full screen, tap Share, then "Add to Home Screen".' : "Full screen isn't available in this browser.",
        ),
      [showToast],
    ),
  )

  const takeSnapshot = useCallback(async () => {
    const video = videoRef.current
    if (!video || snapshotBusy) return
    setSnapshotBusy(true)
    setFlash((n) => n + 1)
    try {
      const blob = await renderSnapshot({ video, lensScale: settings.lensScale, use24h: settings.use24h })
      const file = snapshotFile(blob)
      const result = await shareOrDownload(file)
      if (result === 'needs-gesture') setPendingShare(file)
      else if (result === 'downloaded') showToast('Snapshot saved.')
    } catch (err) {
      console.warn('[claire] snapshot failed', err)
      showToast("Couldn't take a snapshot. Try again.")
    } finally {
      setSnapshotBusy(false)
    }
  }, [videoRef, snapshotBusy, settings.lensScale, settings.use24h, showToast])

  const { widgets } = settings
  const showBattery = widgets.battery && battery !== null
  const hasWidgets = widgets.weather || showBattery || widgets.compass

  return (
    <>
      <div className="safe-pad fixed inset-0 z-10 flex flex-col">
        <main className="flex min-h-0 flex-1 flex-col items-center gap-6 overflow-y-auto pt-[5dvh] landscape:flex-row landscape:items-center landscape:justify-center landscape:gap-10 landscape:pt-0 md:gap-10 portrait:md:pt-[8dvh]">
          <section className="animate-rise landscape:flex-1" style={rise(0)}>
            <Clock use24h={settings.use24h} />
          </section>

          <section className="flex w-full max-w-md flex-col items-center gap-4 landscape:max-w-sm landscape:flex-1 md:max-w-lg md:gap-5">
            {hasWidgets && (
              <div className="animate-rise flex w-full justify-center gap-3 md:gap-4" style={rise(1)}>
                {widgets.weather && <WeatherWidget state={weather.state} request={weather.request} />}
                {showBattery && <BatteryWidget battery={battery} />}
                {widgets.compass && <CompassWidget />}
              </div>
            )}
            {widgets.weather && weather.state.status === 'ready' && (
              // Required attribution for Open-Meteo data (CC BY 4.0).
              <a
                href={OPEN_METEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="animate-fade -my-2 inline-flex min-h-8 items-center px-2 text-[11px] text-white/60 underline-offset-4 hover:underline"
              >
                Weather by Open-Meteo.com
              </a>
            )}
            {widgets.notes && (
              <div className="animate-rise w-full max-w-[25rem] md:max-w-[31rem]" style={rise(2)}>
                <Notes />
              </div>
            )}
          </section>
        </main>

        <footer className="animate-rise flex shrink-0 justify-center pt-3" style={rise(3)}>
          <Dock
            torch={torch}
            onSnapshot={() => void takeSnapshot()}
            snapshotBusy={snapshotBusy}
            fullscreen={fullscreen}
            onSettings={() => setSettingsOpen(true)}
          />
        </footer>
      </div>

      {flash > 0 && (
        <div key={flash} className="pointer-events-none fixed inset-0 z-20 bg-white" style={{ animation: 'flash 450ms ease-out both' }} />
      )}

      <SettingsSheet open={settingsOpen} onClose={closeSettings} batterySupported={battery !== null} />
      {pendingShare && <SnapshotPreview file={pendingShare} onClose={() => setPendingShare(null)} />}
      <Toast toast={toast} onDone={clearToast} />
    </>
  )
}
