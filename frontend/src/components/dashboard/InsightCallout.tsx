'use client'

import { useEffect, useState } from 'react'
import { X, Zap } from 'lucide-react'
import type { Insight } from '@/types'

const KEY = 'horme-dismissed-insight'

export function InsightCallout({ insight }: { insight: Insight }) {
  const [dismissed, setDismissed] = useState(false)

  // hide only while the same insight type stays dismissed; a new type re-shows
  useEffect(() => {
    setDismissed(localStorage.getItem(KEY) === insight.type)
  }, [insight.type])

  if (dismissed) return null

  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent-soft bg-accent-soft p-4" style={{ borderColor: 'var(--accent)' }}>
      <Zap size={18} className="mt-0.5 shrink-0 text-accent" />
      <p className="flex-1 text-sm text-fg">{insight.message}</p>
      <button
        onClick={() => {
          localStorage.setItem(KEY, insight.type)
          setDismissed(true)
        }}
        aria-label="Dismiss insight"
        className="shrink-0 text-fg-3 hover:text-fg"
      >
        <X size={16} />
      </button>
    </div>
  )
}
