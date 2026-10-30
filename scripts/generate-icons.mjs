// Generates Claire's PWA icons with no dependencies: a signed-distance renderer
// plus a minimal PNG encoder built on node:zlib. Run with `npm run icons`.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const OUT = new URL('../public/icons/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Signed distance to a rounded rectangle centred at the origin.
function sdRoundRect(x, y, hw, hh, r) {
  const qx = Math.abs(x) - hw + r
  const qy = Math.abs(y) - hh + r
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
}

const mix = (a, b, t) => a + (b - a) * t
const over = (dst, [r, g, b], a) => {
  dst[0] = mix(dst[0], r, a)
  dst[1] = mix(dst[1], g, a)
  dst[2] = mix(dst[2], b, a)
}

// Shade one sample in unit space (u, v in [0, 1]). `k` shrinks the glyph for maskable safe zones.
function shade(u, v, k) {
  // Background: deep night gradient with a soft teal/violet glow.
  const c = [mix(26, 8, v), mix(28, 9, v), mix(48, 16, v)]
  const glow = Math.max(0, 1 - Math.hypot(u - 0.3, v - 0.25) / 0.7)
  over(c, [90, 200, 220], glow * glow * 0.35)
  const glow2 = Math.max(0, 1 - Math.hypot(u - 0.8, v - 0.85) / 0.6)
  over(c, [150, 110, 240], glow2 * glow2 * 0.3)

  // Glass pane (the "transparent phone").
  const x = (u - 0.5) / k
  const y = (v - 0.5) / k
  const d = sdRoundRect(x, y, 0.21, 0.32, 0.075)
  const px = 1 / 512 / k
  const inside = Math.min(1, Math.max(0, 0.5 - d / px))
  if (inside > 0) {
    over(c, [255, 255, 255], 0.13 * inside)
    // Diagonal glare.
    const g = x * 0.8 + y
    const band = Math.max(0, 1 - Math.abs(g + 0.08) / 0.09)
    over(c, [255, 255, 255], band * 0.14 * inside)
  }
  // Rim.
  const rim = Math.max(0, 1 - Math.abs(d) / 0.009)
  over(c, [255, 255, 255], Math.min(1, rim * 1.4) * 0.85)
  // Lens dot.
  const dot = Math.hypot(x, y + 0.255) - 0.018
  over(c, [255, 255, 255], Math.min(1, Math.max(0, 0.5 - dot / px)) * 0.9)
  return c
}

function render(size, k) {
  const ss = 4
  const buf = Buffer.alloc(size * size * 4)
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const [cr, cg, cb] = shade((px + (sx + 0.5) / ss) / size, (py + (sy + 0.5) / ss) / size, k)
          r += cr
          g += cg
          b += cb
        }
      }
      const i = (py * size + px) * 4
      const n = ss * ss
      buf[i] = Math.round(r / n)
      buf[i + 1] = Math.round(g / n)
      buf[i + 2] = Math.round(b / n)
      buf[i + 3] = 255
    }
  }
  return encodePng(size, buf)
}

const targets = [
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  ['maskable-512.png', 512, 0.78],
  ['apple-touch-icon.png', 180, 0.92],
]
for (const [name, size, k] of targets) {
  writeFileSync(new URL(name, OUT), render(size, k))
  console.log(`wrote public/icons/${name}`)
}

writeFileSync(
  new URL('favicon.svg', OUT),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1c30"/><stop offset="1" stop-color="#080910"/></linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <rect x="18.5" y="11.5" width="27" height="41" rx="7" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".85" stroke-width="2"/>
  <circle cx="32" cy="16.5" r="1.4" fill="#fff"/>
</svg>
`,
)
console.log('wrote public/icons/favicon.svg')
