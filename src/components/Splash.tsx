import { useEffect, useState } from 'react'

/** Wordmark shown while the camera is being requested. Fades out once `visible` turns false. */
export default function Splash({ visible }: { visible: boolean }) {
  const [showHint, setShowHint] = useState(false)

  // If the permission prompt is still up after a few seconds, nudge the user.
  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => setShowHint(true), 3500)
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="aurora">
        <span />
        <span />
        <span />
      </div>
      <div className="relative flex flex-col items-center px-8 text-center">
        <h1 className="animate-rise text-6xl font-extralight tracking-[0.02em] sm:text-7xl">Claire</h1>
        <p className="animate-rise mt-4 text-[15px] text-white/75 [animation-delay:150ms]">
          Your camera stays on your device.
        </p>
        <p
          className={`mt-10 text-sm text-white/60 transition-opacity duration-500 ${
            showHint && visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Allow camera access to see through your screen.
        </p>
      </div>
    </div>
  )
}
