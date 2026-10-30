import { useEffect } from 'react'

export interface ToastMessage {
  id: number
  text: string
}

/** Brief glass pill near the top of the screen. */
export default function Toast({ toast, onDone }: { toast: ToastMessage | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDone, 3200)
    return () => clearTimeout(timer)
  }, [toast, onDone])

  if (!toast) return null
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ top: 'max(env(safe-area-inset-top), 16px)' }}
      role="status"
    >
      <div key={toast.id} className="glass-strong animate-rise max-w-sm rounded-full px-5 py-3 text-center text-sm">
        {toast.text}
      </div>
    </div>
  )
}
