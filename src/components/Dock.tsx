import type { ReactNode } from 'react'
import { ExpandIcon, ShrinkIcon, SlidersIcon, SnapshotIcon, TorchIcon } from './Icons'

interface DockProps {
  torch: { supported: boolean; on: boolean; toggle: () => void }
  onSnapshot: () => void
  snapshotBusy: boolean
  fullscreen: { visible: boolean; active: boolean; toggle: () => void }
  onSettings: () => void
}

function DockButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={`pressable flex h-14 w-14 items-center justify-center rounded-full md:h-16 md:w-16 ${
        active ? 'bg-white text-neutral-900 [text-shadow:none]' : 'bg-white/10 text-white hover:bg-white/15'
      } disabled:opacity-50`}
    >
      {children}
    </button>
  )
}

export default function Dock({ torch, onSnapshot, snapshotBusy, fullscreen, onSettings }: DockProps) {
  return (
    <nav
      aria-label="Dock"
      className="glass mx-auto flex items-center gap-3 rounded-[32px] p-2.5 md:gap-4 md:p-3"
    >
      {torch.supported && (
        <DockButton label={torch.on ? 'Turn torch off' : 'Turn torch on'} onClick={torch.toggle} active={torch.on}>
          <TorchIcon on={torch.on} size={26} />
        </DockButton>
      )}
      <DockButton label="Take snapshot" onClick={onSnapshot} disabled={snapshotBusy}>
        <SnapshotIcon size={26} />
      </DockButton>
      {fullscreen.visible && (
        <DockButton label={fullscreen.active ? 'Exit full screen' : 'Full screen'} onClick={fullscreen.toggle}>
          {fullscreen.active ? <ShrinkIcon size={24} /> : <ExpandIcon size={24} />}
        </DockButton>
      )}
      <DockButton label="Settings" onClick={onSettings}>
        <SlidersIcon size={26} />
      </DockButton>
    </nav>
  )
}
