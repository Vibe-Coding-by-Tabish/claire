import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EFFECTIVE_DATE } from '../../lib/legal'
import LegalLinks from './LegalLinks'

interface LegalPageProps {
  title: string
  children: ReactNode
}

/** Static, readable layout for /privacy and /terms. No camera, no glass over video. */
export default function LegalPage({ title, children }: LegalPageProps) {
  useEffect(() => {
    document.title = `${title} · Claire`
    return () => {
      document.title = 'Claire'
    }
  }, [title])

  return (
    // The app shell locks body scrolling, so legal pages scroll inside their own container.
    <div className="selectable fixed inset-0 overflow-y-auto overscroll-contain bg-[var(--bg)] [text-shadow:none]">
      <div
        className="mx-auto w-full max-w-[680px] px-4 pb-10"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 24px)',
          paddingLeft: 'max(env(safe-area-inset-left), 16px)',
          paddingRight: 'max(env(safe-area-inset-right), 16px)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 40px)',
        }}
      >
        <header className="border-b border-white/10 pb-6">
          <Link to="/" className="inline-flex min-h-11 items-center text-2xl font-extralight tracking-[0.02em] text-white">
            Claire
          </Link>
          <h1 className="mt-4 text-3xl font-light tracking-tight text-white md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-white/55">Last updated: {EFFECTIVE_DATE}</p>
        </header>

        <article className="mt-8 text-[16px] leading-[1.7] text-white/80">{children}</article>

        <footer className="mt-12 flex flex-col items-center gap-1 border-t border-white/10 pt-6 text-center">
          <Link to="/" className="inline-flex min-h-11 items-center text-sm text-white/70 underline-offset-4 hover:underline">
            Back to Claire
          </Link>
          <LegalLinks />
        </footer>
      </div>
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="text-lg font-medium text-white">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">
      {children}
    </a>
  )
}
