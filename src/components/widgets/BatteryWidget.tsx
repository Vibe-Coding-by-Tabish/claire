import type { BatteryInfo } from '../../hooks/useBattery'
import GlassCard from '../GlassCard'
import { BoltIcon } from '../Icons'
import { WIDGET_CLASS } from './widgetStyles'

export default function BatteryWidget({ battery }: { battery: BatteryInfo }) {
  const pct = Math.round(battery.level * 100)
  const low = pct <= 20 && !battery.charging

  return (
    <GlassCard className={WIDGET_CLASS} label={`Battery ${pct}%${battery.charging ? ', charging' : ''}`}>
      <div className="flex items-center gap-1.5">
        <div className="relative h-[14px] w-[28px] rounded-[4px] border border-white/80 p-[2px]">
          <div
            className={`h-full rounded-[2px] transition-[width] duration-500 ${low ? 'bg-red-400' : 'bg-white'}`}
            style={{ width: `${Math.max(6, pct)}%` }}
          />
          <div className="absolute -right-[4px] top-1/2 h-[6px] w-[2px] -translate-y-1/2 rounded-r bg-white/80" />
        </div>
        {battery.charging && <BoltIcon size={14} />}
      </div>
      <div>
        <div className="text-[2rem] font-light leading-none tabular-nums">
          {pct}
          <span className="text-lg text-white/70">%</span>
        </div>
        <div className="mt-1 text-xs text-white/70">{battery.charging ? 'Charging' : 'Battery'}</div>
      </div>
    </GlassCard>
  )
}
