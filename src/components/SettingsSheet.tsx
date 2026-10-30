import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { BLUR_MAX, BLUR_MIN, LENS_MAX, LENS_MIN, useSettings, type Settings } from '../hooks/useSettings'
import { CloseIcon } from './Icons'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  batterySupported: boolean
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex min-h-11 items-center justify-between gap-4 py-1">{children}</div>
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <Row>
      <span className="flex flex-col">
        <span className="text-[15px]">{label}</span>
        {hint && <span className="text-xs text-white/50">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="flex h-11 w-14 shrink-0 items-center justify-center"
      >
        <span className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${checked ? 'bg-white' : 'bg-white/20'}`}>
          <span
            className={`absolute left-0 top-0.5 h-6 w-6 rounded-full shadow transition-transform duration-200 ${
              checked ? 'translate-x-[22px] bg-neutral-900' : 'translate-x-0.5 bg-white'
            }`}
          />
        </span>
      </button>
    </Row>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}) {
  const fill = `${((value - min) / (max - min)) * 100}%`
  return (
    <div className="py-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[15px]">{label}</span>
        <span className="text-sm tabular-nums text-white/70">{display}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': fill } as CSSProperties}
      />
    </div>
  )
}

const WIDGET_LABELS: [keyof Settings['widgets'], string][] = [
  ['weather', 'Weather'],
  ['battery', 'Battery'],
  ['compass', 'Compass'],
  ['notes', 'Note'],
]

export default function SettingsSheet({ open, onClose, batterySupported }: SettingsSheetProps) {
  const { settings, update, setWidget, reset } = useSettings()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`fixed inset-0 z-30 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Light scrim so the lens preview stays visible behind the sheet. */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={`glass-strong absolute inset-x-0 bottom-0 mx-auto max-h-[85dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-[32px] px-6 pt-3 transition-[transform,visibility] duration-300 ease-out sm:bottom-4 sm:rounded-[32px] ${
          open ? 'visible translate-y-0' : 'invisible translate-y-full sm:translate-y-[calc(100%+2rem)]'
        }`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/30" />
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="pressable -mr-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
          >
            <CloseIcon size={20} />
          </button>
        </header>

        <div className="mt-4 space-y-2">
          <Slider
            label="Lens"
            value={settings.lensScale}
            min={LENS_MIN}
            max={LENS_MAX}
            step={0.05}
            display={`${settings.lensScale.toFixed(2)}×`}
            onChange={(lensScale) => update({ lensScale })}
          />
          <p className="-mt-1 text-xs text-white/50">Match the view to what's behind your device so it looks see-through.</p>
          <Slider
            label="Glass blur"
            value={settings.blur}
            min={BLUR_MIN}
            max={BLUR_MAX}
            step={1}
            display={`${settings.blur}px`}
            onChange={(blur) => update({ blur })}
          />
          <Toggle label="24-hour time" checked={settings.use24h} onChange={(use24h) => update({ use24h })} />
        </div>

        <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Widgets</h3>
        <div className="mt-1">
          {WIDGET_LABELS.map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={settings.widgets[key]}
              onChange={(on) => setWidget(key, on)}
              hint={key === 'battery' && !batterySupported ? 'Not available in this browser' : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={reset}
          className="pressable mt-5 h-12 w-full rounded-2xl bg-white/10 text-[15px] font-medium hover:bg-white/15"
        >
          Reset to defaults
        </button>
      </section>
    </div>
  )
}
