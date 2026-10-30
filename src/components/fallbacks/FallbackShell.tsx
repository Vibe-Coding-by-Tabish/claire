import type { ReactNode } from 'react'
import LegalLinks from '../legal/LegalLinks'

interface FallbackShellProps {
  icon?: ReactNode
  title: string
  children: ReactNode
}

/** Animated gradient background with a centred glass card: every non-live state uses this. */
export default function FallbackShell({ icon, title, children }: FallbackShellProps) {
  return (
    <div className="safe-pad fixed inset-0 z-10 flex items-center justify-center overflow-y-auto">
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="relative my-auto flex w-full max-w-md flex-col items-center">
        <div className="glass animate-rise w-full rounded-[32px] p-7 text-center md:p-9">
          {icon && <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/12">{icon}</div>}
          <h1 className="text-2xl font-light tracking-tight md:text-3xl">{title}</h1>
          <div className="mt-3 text-[15px] leading-relaxed text-white/80">{children}</div>
        </div>
        <LegalLinks className="mt-2" />
      </div>
    </div>
  )
}

export function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable mt-6 h-12 w-full rounded-2xl bg-white text-[15px] font-medium text-neutral-900 [text-shadow:none]"
    >
      {children}
    </button>
  )
}
