import { Link } from 'react-router-dom'

/** Small "Privacy · Terms" links. Padding keeps a 44px tap target without looking big. */
export default function LegalLinks({ className = '' }: { className?: string }) {
  const link = 'inline-flex min-h-11 items-center px-2 underline-offset-4 hover:underline'
  return (
    <nav aria-label="Legal" className={`flex items-center justify-center text-xs text-white/55 ${className}`}>
      <Link to="/privacy" className={link}>
        Privacy
      </Link>
      <span aria-hidden="true">·</span>
      <Link to="/terms" className={link}>
        Terms
      </Link>
    </nav>
  )
}
