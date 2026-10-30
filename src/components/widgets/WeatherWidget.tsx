import { describeWeather, useWeather } from '../../hooks/useWeather'
import GlassCard from '../GlassCard'
import { LocationIcon, WeatherIcon } from '../Icons'
import { WIDGET_CLASS } from './widgetStyles'

export default function WeatherWidget() {
  const { state, request } = useWeather()

  if (state.status === 'ready') {
    const { temp, high, low, code, isDay } = state.data
    const { kind, label } = describeWeather(code)
    return (
      <GlassCard className={WIDGET_CLASS} onClick={request} label={`${label}, ${temp} degrees. Tap to refresh.`}>
        <WeatherIcon kind={kind} isDay={isDay} size={26} />
        <div>
          <div className="text-[2rem] font-light leading-none">{temp}°</div>
          <div className="mt-1 truncate text-xs text-white/80">{label}</div>
          <div className="text-xs text-white/60">
            H:{high}° L:{low}°
          </div>
        </div>
      </GlassCard>
    )
  }

  const message = {
    off: 'Tap to show weather',
    locating: 'Finding you…',
    loading: 'Loading…',
    denied: 'Location is off. Tap to retry',
    error: "Couldn't load. Tap to retry",
  }[state.status]

  return (
    <GlassCard className={WIDGET_CLASS} onClick={request} label={message}>
      <LocationIcon size={24} className={state.status === 'locating' || state.status === 'loading' ? 'animate-pulse' : ''} />
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Weather</div>
        <div className="mt-1 text-[13px] leading-tight text-white/90">{message}</div>
      </div>
    </GlassCard>
  )
}
