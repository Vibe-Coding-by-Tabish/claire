# Claire

A see-through phone home screen for the web. Claire uses your rear camera as a live,
full-screen background, so your phone or tablet looks transparent, and puts a minimal
frosted-glass home screen on top: clock, weather, battery, compass, a sticky note and a dock.

Everything runs in the browser. There's no backend, no analytics, and the camera feed never
leaves the device. The only network call is the optional weather lookup (Open-Meteo, no key).

## Quick start

```bash
npm install
npm run dev        # https://localhost:5173
npm run build      # type-check + production build into dist/
npm run lint
npm run preview    # serve the production build
```

Node 20+ is required.

## Testing on your phone (same Wi-Fi)

Browsers only allow camera access on secure origins, so the dev server runs over HTTPS with
a self-signed certificate (`@vitejs/plugin-basic-ssl`).

1. Run `npm run dev -- --host`.
2. Vite prints a `Network:` URL such as `https://192.168.1.20:5173`. Open it on your phone.
3. Accept the certificate warning:
   - **iOS Safari:** tap *Show Details*, then *visit this website*, then *Visit Website*.
   - **Android Chrome:** tap *Advanced*, then *Proceed to …*.
4. Allow camera access. The live see-through home screen appears with no extra taps.

If the phone can't reach the URL, check that both devices are on the same network and that
your firewall allows inbound connections on port 5173.

### Simulating states

Append `?simulate=<state>` to force a screen without needing the matching device:

| Value            | Shows                                                       |
| ---------------- | ----------------------------------------------------------- |
| `live`           | Home screen over an animated gradient (no camera)           |
| `denied`         | Camera permission denied, with per-platform steps           |
| `no-rear-camera` | Desktop fallback with a QR code                             |
| `in-use`         | Camera busy in another app                                  |
| `insecure`       | Not served over HTTPS                                       |
| `unsupported`    | Browser has no `getUserMedia`                               |
| `error`          | Generic camera failure                                      |
| `inapp`          | In-app-browser banner (the camera is still attempted)       |

## Deploying to Vercel

The app is a static Vite build. `vercel.json` rewrites every path to `/index.html`, so deep
links like `/privacy` and `/terms` survive a refresh. It also sets these headers on all routes:

- `Permissions-Policy: camera=(self), geolocation=(self), microphone=(), payment=(), usb=()`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`: only the app's own origin, plus `https://api.open-meteo.com`
  for `connect-src`. `blob:`/`data:` are allowed for images and media (snapshot preview,
  camera stream).

Deploy options:

- **Dashboard:** import the repo. Vercel detects Vite (build `npm run build`, output `dist`).
- **CLI:** `npx vercel` for a preview deploy, `npx vercel --prod` for production.

Vercel serves over HTTPS, so the camera works on any device straight away.

If you ever add a new external service (a CDN, analytics, an API), you must add its origin to
the CSP in `vercel.json` or the browser will block it. Update the Privacy Policy at the same
time (see below).

## How it works

- **Camera** (`src/hooks/useCamera.ts`): requests `facingMode: { ideal: "environment" }` at
  1920×1080. If the track that comes back isn't rear-facing, Claire checks for another
  camera. When the only camera isn't rear-facing, it shows the desktop fallback. Tracks stop
  while the tab is hidden and restart when it's visible again.
- **Lens scale:** a CSS `scale()` on the `<video>` (default 1.4×, adjustable from 1.0× to
  2.0× in Settings). It zooms the feed to roughly match the real field of view, which is
  what sells the "transparent" look.
- **Snapshot** (`src/lib/snapshot.ts`): redraws the frame with the same cover-crop and
  scale, adds the clock, date and a Claire watermark, then shares it with
  `navigator.share({ files })`. Where file sharing isn't available it downloads instead. If
  the browser rejects the share because the tap's user activation expired, a preview with a
  Share button appears.
- **Settings and notes** live in `localStorage` under `claire.*`. Weather is cached for 30
  minutes.
- **PWA:** installable, with a service worker that caches the app shell only. Weather
  requests always go to the network.

## Browser support

| Feature                 | iOS Safari 16.4+               | Android Chrome          | Samsung Internet | Surface (Edge/Chrome) | Desktop          |
| ----------------------- | ------------------------------ | ----------------------- | ---------------- | --------------------- | ---------------- |
| Rear camera background  | ✅                             | ✅                      | ✅               | ✅ (rear camera)      | Fallback + QR    |
| Torch                   | Hidden (not exposed)           | ✅ on most devices      | ✅ on most       | Hidden                | n/a              |
| Snapshot share          | ✅ share sheet                 | ✅ share sheet          | ✅               | ✅ / download         | Download         |
| Fullscreen              | iPhone: "Add to Home Screen" hint; iPad: ✅ | ✅            | ✅               | ✅                    | ✅               |
| Battery widget          | Hidden (no API)                | ✅                      | ✅               | ✅                    | ✅               |
| Compass                 | ✅ after a tap (permission)    | ✅ (absolute orientation) | ✅             | Usually no sensor     | No sensor        |
| Screen wake lock        | ✅ (16.4+)                     | ✅                      | ✅               | ✅                    | ✅               |
| Weather                 | ✅                             | ✅                      | ✅               | ✅                    | ✅               |

Notes:

- **In-app browsers** (Instagram, Facebook, LinkedIn, X, LINE, Snapchat) often block or
  limit the camera. Claire shows an "Open in Safari/Chrome" banner with a copy-link button
  and still tries the camera underneath.
- **iOS** needs HTTPS and a user-visible `<video playsinline muted>`, which Claire already
  does. Installed to the Home Screen, it runs full screen with a translucent status bar.
- Pinch-zoom is disabled on purpose: `user-scalable=no` plus a `gesturestart` guard for iOS.
- Animations respect `prefers-reduced-motion`.

## Legal & privacy

Claire ships with a Privacy Policy at `/privacy` and Terms of Use at `/terms`. They're linked
from the splash screen, the Settings sheet ("About"), and every fallback screen. The camera is
only ever requested on `/`; it never starts on the legal pages.

### Fill in the placeholders before launch

All editable values live in [`src/lib/legal.ts`](src/lib/legal.ts):

| Constant         | Current value          | Replace with                                   |
| ---------------- | ---------------------- | ---------------------------------------------- |
| `CONTACT_EMAIL`  | `[CONTACT_EMAIL]`      | The address that receives privacy/terms emails |
| `OWNER_NAME`     | `[OWNER_NAME]`         | Your name or your business's legal name        |
| `EFFECTIVE_DATE` | `[EFFECTIVE_DATE]`     | The date the current policy takes effect       |
| `COUNTRY`        | `India`                | Governing-law country (already set)            |

Change `EFFECTIVE_DATE` each time you materially change either page.

### Open-Meteo is free for non-commercial use only

Weather comes from Open-Meteo's free API, which is licensed for **non-commercial use** with
attribution (CC BY 4.0). The required "Weather by Open-Meteo.com" credit shows whenever weather
is on screen, and in Settings → About. If Claire is ever monetized (ads, paid features,
sponsorships), switch to a paid Open-Meteo plan first. There's a reminder comment in
`src/hooks/useWeather.ts`.

### Keep the policy true

The Privacy Policy promises no cookies, analytics, ads, tracking, third-party fonts/CDNs,
accounts, or backend. **If you add any of these, you must update the Privacy Policy (and the CSP
in `vercel.json`) before shipping.** The same goes for new `localStorage` keys: the policy lists
every key Claire stores (`claire.settings`, `claire.note`, `claire.weather`, `claire.compass`,
`claire.safetyNoticeSeen`).

Other privacy details:

- Inter is self-hosted via `@fontsource/inter` (Latin subset, weights 200–600). No request goes
  to Google Fonts.
- Weather coordinates are rounded to about 1 km before being sent to Open-Meteo, and are never
  stored.
- A one-time safety reminder ("Look up from Claire when you're on the move.") appears on the
  first launch only.

## Project layout

```
src/
  hooks/      useCamera, useWakeLock, useClock, useWeather, useCompass, useBattery, useTorch, useSettings
  components/ CameraBackground, Splash, HomeScreen, Clock, GlassCard, Dock, SettingsSheet, Notes,
              Icons, Toast, SnapshotPreview
  components/widgets/   WeatherWidget, BatteryWidget, CompassWidget
  components/fallbacks/ Denied, InAppBrowser, DesktopFallback, Unsupported, FallbackShell
  components/legal/     LegalPage, LegalLinks
  pages/      Privacy, Terms
  lib/        detect.ts, legal.ts, snapshot.ts, storage.ts, time.ts
  Root.tsx    routes: / (app), /privacy, /terms
scripts/generate-icons.mjs   dependency-free PNG icon generator (npm run icons)
```
