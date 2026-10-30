import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'live'
  | 'denied'
  | 'no-rear-camera'
  | 'in-use'
  | 'insecure'
  | 'unsupported'
  | 'error'

const VIDEO: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 1920 },
  height: { ideal: 1080 },
}

const REAR_LABEL = /back|rear|environment|world/i

class CameraError extends Error {
  readonly status: CameraStatus
  constructor(status: CameraStatus) {
    super(status)
    this.status = status
  }
}

function mapError(err: unknown): CameraStatus {
  if (err instanceof CameraError) return err.status
  switch ((err as DOMException | undefined)?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
    case 'PermissionDeniedError':
      return 'denied'
    case 'NotSupportedError':
      return 'unsupported'
    case 'NotFoundError':
    case 'OverconstrainedError':
    case 'DevicesNotFoundError':
      return 'no-rear-camera'
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'in-use'
    default:
      return 'error'
  }
}

const stopStream = (s: MediaStream | null) => s?.getTracks().forEach((t) => t.stop())

/**
 * Opens the rear camera and verifies it really is rear-facing. If the browser handed us a
 * front or unlabelled camera but another video input exists, prefer one whose label looks
 * rear-facing. Only a device whose single camera isn't rear-facing reports no-rear-camera.
 */
async function openRearCamera(): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO, audio: false })
  const track = stream.getVideoTracks()[0]
  if (!track) {
    stopStream(stream)
    throw new CameraError('no-rear-camera')
  }
  if (track.getSettings().facingMode === 'environment') return stream

  const inputs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput')
  if (inputs.length <= 1) {
    stopStream(stream)
    throw new CameraError('no-rear-camera')
  }

  const currentId = track.getSettings().deviceId
  const rear = inputs.find((d) => d.deviceId !== currentId && REAR_LABEL.test(d.label))
  if (!rear) return stream // Several cameras, none clearly rear: keep the browser's pick.

  stopStream(stream)
  const { width, height } = VIDEO
  return navigator.mediaDevices.getUserMedia({ video: { width, height, deviceId: { exact: rear.deviceId } }, audio: false })
}

export function useCamera() {
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const requestId = useRef(0)
  const wanted = useRef(false)

  const release = useCallback(() => {
    requestId.current++
    stopStream(streamRef.current)
    streamRef.current = null
    setStream(null)
  }, [])

  /** `silent` keeps the current status while reconnecting (e.g. after the tab was hidden). */
  const start = useCallback(async (silent = false) => {
    wanted.current = true
    if (!window.isSecureContext) return setStatus('insecure')
    if (!navigator.mediaDevices?.getUserMedia) return setStatus('unsupported')

    const id = ++requestId.current
    if (!silent) setStatus('requesting')
    try {
      const next = await openRearCamera()
      if (id !== requestId.current) return stopStream(next) // superseded or released meanwhile
      stopStream(streamRef.current)
      streamRef.current = next
      setStream(next)
      setStatus('live')
    } catch (err) {
      if (id !== requestId.current) return
      console.warn('[claire] camera failed', err)
      setStatus(mapError(err))
    }
  }, [])

  // Release the camera while hidden (battery, privacy indicator) and reopen when visible again.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') release()
      else if (wanted.current && !streamRef.current) void start(true)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [release, start])

  // If the OS takes the camera away (a call, another app), try to get it back.
  useEffect(() => {
    const track = stream?.getVideoTracks()[0]
    if (!track) return
    const onEnded = () => {
      if (streamRef.current !== stream) return
      streamRef.current = null
      setStream(null)
      if (document.visibilityState === 'visible') void start(true)
    }
    track.addEventListener('ended', onEnded)
    return () => track.removeEventListener('ended', onEnded)
  }, [stream, start])

  useEffect(() => () => stopStream(streamRef.current), [])

  const track = stream?.getVideoTracks()[0] ?? null
  return { status, stream, track, start, release }
}
