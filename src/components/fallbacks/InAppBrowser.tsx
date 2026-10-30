import { useState } from 'react'
import { isIOS, shareableUrl } from '../../lib/detect'
import { CloseIcon, LinkIcon } from '../Icons'
import LegalLinks from '../legal/LegalLinks'

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older in-app webviews lack the async clipboard API.
    const input = document.createElement('textarea')
    input.value = text
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    const ok = document.execCommand('copy')
    input.remove()
    return ok
  }
}

/** Banner shown over everything inside Instagram/Facebook/etc. The camera is still attempted underneath. */
export default function InAppBrowser({ app }: { app: string }) {
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied] = useState(false)
  if (dismissed) return null
  const browser = isIOS ? 'Safari' : 'Chrome'

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3" style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
      <div className="glass-strong animate-rise flex w-full max-w-md items-center gap-3 rounded-[24px] py-3 pl-4 pr-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Open in {browser} for the full effect</p>
          <p className="text-xs text-white/65">
            {app}'s browser can limit the camera. Copy the link, then paste it in {browser}.
          </p>
          <LegalLinks className="-mb-3 -ml-2 -mt-1 justify-start" />
        </div>
        <button
          type="button"
          onClick={() => void copy(shareableUrl()).then(setCopied)}
          className="pressable flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-neutral-900 [text-shadow:none]"
        >
          <LinkIcon size={16} />
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <CloseIcon size={18} />
        </button>
      </div>
    </div>
  )
}
