import { formatDate, formatTime, greeting } from './time'

interface SnapshotOptions {
  video: HTMLVideoElement
  lensScale: number
  use24h: boolean
  now?: Date
}

const MAX_EDGE = 2560

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * Renders what's on screen (the cover-cropped, lens-scaled camera frame) plus the clock,
 * date and a Claire watermark into a JPEG blob sized to the viewport.
 */
export async function renderSnapshot({ video, lensScale, use24h, now = new Date() }: SnapshotOptions): Promise<Blob> {
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) throw new Error('Camera frame not ready')

  const cssW = window.innerWidth
  const cssH = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_EDGE / Math.max(cssW, cssH))
  const W = Math.round(cssW * dpr)
  const H = Math.round(cssH * dpr)

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  // Same maths as `object-fit: cover` + `transform: scale(lensScale)` around the centre.
  const cover = Math.max(W / vw, H / vh) * lensScale
  const dw = vw * cover
  const dh = vh * cover
  ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh)

  // Vignette, matching the live overlay.
  const vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) / 2)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, W, H)
  const topShade = ctx.createLinearGradient(0, 0, 0, H * 0.45)
  topShade.addColorStop(0, 'rgba(0,0,0,0.28)')
  topShade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topShade
  ctx.fillRect(0, 0, W, H * 0.45)

  try {
    await Promise.all([document.fonts.load('200 100px Inter'), document.fonts.load('500 20px Inter')])
  } catch {
    // Fall back to system sans if fonts fail to load.
  }

  const u = Math.min(W, H) / 100 // 1% of the short edge
  const family = 'Inter, system-ui, -apple-system, sans-serif'
  const { time, period } = formatTime(now, use24h)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = u * 1.6
  ctx.shadowOffsetY = u * 0.25

  const clockY = H * 0.24
  ctx.font = `500 ${u * 3.6}px ${family}`
  ctx.globalAlpha = 0.85
  ctx.fillText(greeting(now), W / 2, clockY - u * 24)
  ctx.globalAlpha = 1

  const clockSize = u * 26
  ctx.font = `200 ${clockSize}px ${family}`
  const timeWidth = ctx.measureText(time).width
  ctx.fillText(time, W / 2, clockY)
  if (period) {
    ctx.font = `400 ${u * 4.2}px ${family}`
    ctx.textAlign = 'left'
    ctx.fillText(period, W / 2 + timeWidth / 2 + u * 1.2, clockY - clockSize * 0.52)
    ctx.textAlign = 'center'
  }

  ctx.font = `400 ${u * 4.4}px ${family}`
  ctx.globalAlpha = 0.9
  ctx.fillText(formatDate(now), W / 2, clockY + u * 8)
  ctx.globalAlpha = 1

  // Watermark: a small glass pill at the bottom.
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = u * 2
  ctx.shadowOffsetY = 0
  ctx.font = `500 ${u * 3.4}px ${family}`
  const label = 'Claire'
  const textW = ctx.measureText(label).width
  const dot = u * 1.1
  const pillH = u * 8
  const pillW = textW + dot * 2 + u * 9
  const pillX = (W - pillW) / 2
  const pillY = H - pillH - u * 8
  roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2)
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.lineWidth = Math.max(1, u * 0.18)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.stroke()

  const contentX = pillX + u * 4
  ctx.beginPath()
  ctx.arc(contentX + dot, pillY + pillH / 2, dot, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, contentX + dot * 2 + u * 1.6, pillY + pillH / 2 + u * 0.15)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), 'image/jpeg', 0.92),
  )
}

export function snapshotFile(blob: Blob, now = new Date()): File {
  const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-')
  return new File([blob], `claire-${stamp}.jpg`, { type: 'image/jpeg' })
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled' | 'needs-gesture'

/** Share via the Web Share API when files are supported, otherwise download. */
export async function shareOrDownload(file: File, allowDownload = true): Promise<ShareResult> {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Claire' })
      return 'shared'
    } catch (err) {
      const name = (err as DOMException).name
      if (name === 'AbortError') return 'cancelled'
      // Transient user activation expired while we were rendering; needs a fresh tap.
      if (name === 'NotAllowedError') return 'needs-gesture'
      if (!allowDownload) throw err
    }
  }
  download(file)
  return 'downloaded'
}

export function download(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
