'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { STATUSES, SOURCES, sourceLabel } from '@/lib/status'

const SORTS = [
  { key: 'appliedDate', label: 'Applied' },
  { key: 'company', label: 'Company' },
  { key: 'lastUpdated', label: 'Updated' },
]

export function BoardToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const sort = params.get('sort') ?? 'appliedDate'
  const order = params.get('order') ?? 'desc'
  const status = params.get('status') ?? ''
  const source = params.get('source') ?? ''

  function set(next: Record<string, string>) {
    const p = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    router.push(`${pathname}?${p.toString()}`)
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-[10px] uppercase tracking-widest text-fg-3">sort</span>
      {SORTS.map((s) => {
        const active = sort === s.key
        return (
          <button
            key={s.key}
            onClick={() => set({ sort: s.key })}
            aria-pressed={active}
            className={`relative rounded-md border px-3 py-1.5 ${
              active ? 'border-accent text-fg' : 'border-line text-fg-2 hover:text-fg'
            }`}
          >
            {active && (
              <span className="absolute left-1.5 top-1 text-accent" aria-hidden style={{ transform: 'skewX(-12deg)' }}>
                ´
              </span>
            )}
            <span className={active ? 'pl-2' : ''}>{s.label}</span>
          </button>
        )
      })}
      <button
        onClick={() => set({ order: order === 'asc' ? 'desc' : 'asc' })}
        className="rounded-md border border-line px-2.5 py-1.5 text-fg-2 hover:text-fg"
        aria-label={`Sort ${order === 'asc' ? 'ascending' : 'descending'}`}
      >
        {order === 'asc' ? '↑' : '↓'}
      </button>

      <span className="ml-2 text-[10px] uppercase tracking-widest text-fg-3">filter</span>
      <select
        value={status}
        onChange={(e) => set({ status: e.target.value })}
        aria-label="Filter by status"
        className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-fg"
      >
        <option value="">all status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={source}
        onChange={(e) => set({ source: e.target.value })}
        aria-label="Filter by source"
        className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-fg"
      >
        <option value="">all sources</option>
        {SOURCES.map((s) => (
          <option key={s} value={s}>{sourceLabel(s)}</option>
        ))}
      </select>
    </div>
  )
}
