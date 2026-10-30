import { useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage'

/** A small glass sticky note, autosaved on every keystroke. */
export default function Notes() {
  const [text, setText] = useState(() => readJSON('note', ''))

  return (
    <label
      className="glass block w-full rounded-[24px] px-5 pb-4 pt-3"
      style={{ backgroundColor: 'rgb(255 236 170 / 0.08)' }}
    >
      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Note</span>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          writeJSON('note', e.target.value)
        }}
        placeholder="Tap to write something…"
        rows={2}
        maxLength={1000}
        spellCheck={false}
        className="mt-1 block max-h-32 min-h-[3rem] w-full resize-none bg-transparent text-[16px] leading-snug text-white outline-none placeholder:text-white/50 [field-sizing:content]"
      />
    </label>
  )
}
