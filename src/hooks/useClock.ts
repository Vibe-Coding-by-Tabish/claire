import { useEffect, useState } from 'react'

/** Current time, re-rendering on each second boundary. */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer: number
    const tick = () => {
      const d = new Date()
      setNow(d)
      timer = window.setTimeout(tick, 1000 - d.getMilliseconds())
    }
    timer = window.setTimeout(tick, 1000 - new Date().getMilliseconds())
    return () => clearTimeout(timer)
  }, [])
  return now
}
