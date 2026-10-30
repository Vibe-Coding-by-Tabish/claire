import { useClock } from '../hooks/useClock'
import { formatDate, formatTime, greeting } from '../lib/time'

export default function Clock({ use24h }: { use24h: boolean }) {
  const now = useClock()
  const { time, period } = formatTime(now, use24h)

  return (
    <div className="flex flex-col items-center text-center" role="timer" aria-live="off">
      <p className="text-[15px] font-medium tracking-wide text-white/85 md:text-lg">{greeting(now)}</p>
      <div className="relative mt-1 flex items-start leading-none">
        <span className="text-[clamp(5rem,24vw,9.5rem)] font-extralight tracking-[-0.03em] tabular-nums md:text-[11rem] [@media(max-height:480px)]:text-[5.5rem]">
          {time}
        </span>
        {period && (
          <span className="absolute left-full ml-2 mt-[0.9em] text-base font-normal text-white/80 md:text-xl">{period}</span>
        )}
      </div>
      <p className="mt-2 text-lg font-normal text-white/90 md:text-2xl">{formatDate(now)}</p>
    </div>
  )
}
