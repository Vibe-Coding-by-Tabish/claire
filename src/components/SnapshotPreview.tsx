import { useEffect, useMemo } from 'react'
import { download, shareOrDownload } from '../lib/snapshot'
import { CloseIcon } from './Icons'

/**
 * Shown when the browser refused to share straight away (the tap's user activation expired
 * while the image rendered). A fresh tap on Share satisfies the gesture requirement.
 */
export default function SnapshotPreview({ file, onClose }: { file: File; onClose: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  const canShare = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  return (
    <div className="animate-fade fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div
        className="glass-strong animate-rise flex max-h-full w-full max-w-sm flex-col gap-4 rounded-[32px] p-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Snapshot"
      >
        <div className="flex items-center justify-between pl-2">
          <span className="text-[15px] font-medium">Your snapshot</span>
          <button type="button" onClick={onClose} aria-label="Close" className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
            <CloseIcon size={20} />
          </button>
        </div>
        <img src={url} alt="Snapshot preview" className="min-h-0 w-full flex-1 rounded-[20px] object-contain" />
        <div className="flex gap-3">
          {canShare && (
            <button
              type="button"
              onClick={() => void shareOrDownload(file).then((r) => r !== 'needs-gesture' && r !== 'cancelled' && onClose())}
              className="pressable h-12 flex-1 rounded-2xl bg-white text-[15px] font-medium text-neutral-900 [text-shadow:none]"
            >
              Share
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              download(file)
              onClose()
            }}
            className="pressable h-12 flex-1 rounded-2xl bg-white/15 text-[15px] font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
