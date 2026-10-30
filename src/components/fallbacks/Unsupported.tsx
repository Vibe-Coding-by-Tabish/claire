import { CameraOffIcon } from '../Icons'
import FallbackShell, { PrimaryButton } from './FallbackShell'

export type UnsupportedKind = 'insecure' | 'unsupported' | 'in-use' | 'error'

export default function Unsupported({ kind, onRetry }: { kind: UnsupportedKind; onRetry: () => void }) {
  if (kind === 'insecure') {
    const httpsUrl = location.href.replace(/^http:/, 'https:')
    return (
      <FallbackShell icon={<CameraOffIcon size={26} />} title="Needs a secure connection">
        <p>Browsers only allow camera access over HTTPS.</p>
        <a
          href={httpsUrl}
          className="pressable mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-white text-[15px] font-medium text-neutral-900 [text-shadow:none]"
        >
          Open the secure version
        </a>
      </FallbackShell>
    )
  }

  if (kind === 'unsupported') {
    return (
      <FallbackShell icon={<CameraOffIcon size={26} />} title="This browser can't use the camera">
        <p>Try the latest Safari on iPhone and iPad, or Chrome on Android.</p>
      </FallbackShell>
    )
  }

  if (kind === 'in-use') {
    return (
      <FallbackShell icon={<CameraOffIcon size={26} />} title="Camera is busy">
        <p>Another app or tab is using your camera. Close it, then try again.</p>
        <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
      </FallbackShell>
    )
  }

  return (
    <FallbackShell icon={<CameraOffIcon size={26} />} title="Something went wrong">
      <p>The camera couldn't start.</p>
      <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
    </FallbackShell>
  )
}
