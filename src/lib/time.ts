export function greeting(date: Date): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 22) return 'Good evening'
  return 'Good night'
}

export function formatTime(date: Date, use24h: boolean): { time: string; period: string } {
  const m = String(date.getMinutes()).padStart(2, '0')
  if (use24h) return { time: `${String(date.getHours()).padStart(2, '0')}:${m}`, period: '' }
  const h = date.getHours() % 12 || 12
  return { time: `${h}:${m}`, period: date.getHours() < 12 ? 'AM' : 'PM' }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}
