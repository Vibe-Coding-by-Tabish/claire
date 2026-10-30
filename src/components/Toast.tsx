import { useEffect } from 'react'

export interface ToastMessage {
  id: number
  text: string
  /** How long it stays up, in ms. */
  duration?: number
}

/** Brief glass pill near the top of the screen. Auto-dismisses; tapping it dismisses early. */
export default function Toast({ toast, onDone }: { toast: ToastMessage | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDone, toast.duration ?? 3200)
    return () => clearTimeout(timer)
  }, [toast, onDone])

  if (!toast) return null
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ top: 'max(env(safe-area-inset-top), 16px)' }}
      role="status"
    >
      <div
        key={toast.id}
        onClick={onDone}
        className="glass-strong animate-rise pointer-events-auto max-w-sm rounded-full px-5 py-3 text-center text-sm">
        {toast.text}
      </div>
    </div>
  )
}
