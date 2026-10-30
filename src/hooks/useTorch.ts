import { useCallback, useEffect, useState } from 'react'

type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean }

function hasTorch(track: MediaStreamTrack | null): boolean {
  try {
    return (track?.getCapabilities?.() as TorchCapabilities | undefined)?.torch === true
  } catch {
    return false
  }
}

/** Torch control for the active camera track. `supported` is false where the capability isn't exposed. */
export function useTorch(track: MediaStreamTrack | null) {
  // Torch state belongs to a specific track; a new track starts with the torch off.
  const [state, setState] = useState<{ track: MediaStreamTrack | null; on: boolean }>({ track: null, on: false })
  const [, setProbe] = useState(0)

  // Some Android devices only report torch capability shortly after the track starts.
  useEffect(() => {
    if (!track) return
    const timer = window.setTimeout(() => setProbe((n) => n + 1), 800)
    return () => clearTimeout(timer)
  }, [track])

  const on = state.track === track && state.on
  const supported = hasTorch(track)

  const toggle = useCallback(async () => {
    if (!track) return
    const next = !on
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      setState({ track, on: next })
    } catch (err) {
      console.warn('[claire] torch failed', err)
    }
  }, [track, on])

  return { supported, on, toggle }
}
