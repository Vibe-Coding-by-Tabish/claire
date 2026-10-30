import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

interface CameraBackgroundProps {
  stream: MediaStream | null
  scale: number
}

/** Full-viewport live camera feed with a legibility vignette. */
const CameraBackground = forwardRef<HTMLVideoElement | null, CameraBackgroundProps>(function CameraBackground(
  { stream, scale },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  useImperativeHandle<HTMLVideoElement | null, HTMLVideoElement | null>(ref, () => videoRef.current, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    if (stream) void video.play().catch(() => {})
  }, [stream])

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--bg)]" aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        onPlaying={() => setPlaying(true)}
        className="absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-300 ease-out"
        style={{ transform: `scale(${scale})`, opacity: playing && stream ? 1 : 0 }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgb(0 0 0 / 0) 45%, rgb(0 0 0 / 0.42) 100%), linear-gradient(to bottom, rgb(0 0 0 / 0.25), rgb(0 0 0 / 0) 40%, rgb(0 0 0 / 0) 75%, rgb(0 0 0 / 0.25))',
        }}
      />
    </div>
  )
})

export default CameraBackground
