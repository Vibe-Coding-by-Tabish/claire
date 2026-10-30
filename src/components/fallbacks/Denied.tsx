import { isAndroid, isIOS, isSamsungInternet } from '../../lib/detect'
import { CameraOffIcon } from '../Icons'
import FallbackShell, { PrimaryButton } from './FallbackShell'

const STEPS = {
  ios: { name: 'iPhone & iPad (Safari)', steps: ['Tap the aA button in the address bar', 'Choose Website Settings', 'Set Camera to Allow'] },
  android: { name: 'Android (Chrome)', steps: ['Tap the lock or tune icon next to the address', 'Open Permissions', 'Turn Camera on'] },
  samsung: { name: 'Samsung Internet', steps: ['Tap the lock icon in the address bar', 'Open Site permissions', 'Allow Camera'] },
  desktop: { name: 'Desktop browsers', steps: ['Click the camera or lock icon in the address bar', 'Allow camera access'] },
}

export default function Denied({ onRetry }: { onRetry: () => void }) {
  const primary: keyof typeof STEPS = isIOS ? 'ios' : isSamsungInternet ? 'samsung' : isAndroid ? 'android' : 'desktop'
  const order = [primary, ...(['ios', 'android'] as const).filter((k) => k !== primary)]

  return (
    <FallbackShell icon={<CameraOffIcon size={26} />} title="Camera access is off">
      <p>Claire needs your camera to show what's behind your screen. Nothing leaves your device.</p>
      <div className="mt-5 space-y-3 text-left">
        {order.map((key, i) => {
          const { name, steps } = STEPS[key]
          return (
            <div key={key} className={`rounded-2xl p-4 ${i === 0 ? 'bg-white/12' : 'bg-white/5 opacity-70'}`}>
              <div className="text-sm font-medium">{name}</div>
              <ol className="mt-1.5 list-decimal space-y-0.5 pl-5 text-sm text-white/80">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>
      <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
      <p className="mt-3 text-xs text-white/50">Still blocked? Reload the page after changing the setting.</p>
    </FallbackShell>
  )
}
