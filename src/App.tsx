import { useEffect, useRef, useState } from 'react'
import CameraBackground from './components/CameraBackground'
import Denied from './components/fallbacks/Denied'
import DesktopFallback from './components/fallbacks/DesktopFallback'
import InAppBrowser from './components/fallbacks/InAppBrowser'
import Unsupported from './components/fallbacks/Unsupported'
import HomeScreen from './components/HomeScreen'
import Splash from './components/Splash'
import { useCamera, type CameraStatus } from './hooks/useCamera'
import { useSettings } from './hooks/useSettings'
import { useWakeLock } from './hooks/useWakeLock'
import { detectInAppBrowser, getSimulation } from './lib/detect'

const SPLASH_MS = 1000
const simulation = getSimulation()
const inAppBrowser = detectInAppBrowser()
// `?simulate=<state>` skips the camera and forces that screen. `inapp` only forces the banner.
const forcedStatus: CameraStatus | null = simulation && simulation !== 'inapp' ? simulation : null

export default function App() {
  const { settings } = useSettings()
  const camera = useCamera()
  const { start } = camera
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSplashDone(true)
      if (!forcedStatus) void start()
    }, SPLASH_MS)
    return () => clearTimeout(timer)
  }, [start])

  const status = forcedStatus ?? camera.status
  const live = status === 'live'
  useWakeLock(live)

  const showSplash = !splashDone || status === 'idle' || status === 'requesting'
  const retry = () => void start()

  let screen = null
  if (!showSplash) {
    switch (status) {
      case 'live':
        screen = <HomeScreen track={camera.track} videoRef={videoRef} />
        break
      case 'denied':
        screen = <Denied onRetry={retry} />
        break
      case 'no-rear-camera':
        screen = <DesktopFallback />
        break
      case 'insecure':
      case 'unsupported':
      case 'in-use':
      case 'error':
        screen = <Unsupported kind={status} onRetry={retry} />
        break
    }
  }

  return (
    <>
      {forcedStatus ? (
        // Layout preview without a camera (`?simulate=live`).
        live && (
          <div className="aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )
      ) : (
        <CameraBackground ref={videoRef} stream={camera.stream} scale={settings.lensScale} />
      )}
      {screen}
      <Splash visible={showSplash} />
      {inAppBrowser && <InAppBrowser app={inAppBrowser} />}
    </>
  )
}
