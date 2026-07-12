'use client'

import { STATUSES, SOURCES, sourceLabel } from '@/lib/status'
import type { ApplicationStatus } from '@/types'

const SORTS = [
  { key: 'pipeline', label: 'Stage' },
  { key: 'appliedDate', label: 'Age' },
  { key: 'lastUpdated', label: 'Updated' },
]

export interface BoardFilters {
  sort: string
  order: 'asc' | 'desc'
  status: ApplicationStatus | ''
  source: string
  company: string
}

export function BoardToolbar({
  filters,
  onChange,
}: {
  filters: BoardFilters
  onChange: (next: Partial<BoardFilters>) => void
}) {
  const { sort, order, status, source, company } = filters

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-[10px] uppercase tracking-widest text-fg-3">sort</span>
      {SORTS.map((s) => {
        const active = sort === s.key
        return (
          <button
            key={s.key}
            onClick={() => onChange({ sort: s.key })}
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
        onClick={() => onChange({ order: order === 'asc' ? 'desc' : 'asc' })}
        className="rounded-md border border-line px-2.5 py-1.5 text-fg-2 hover:text-fg"
        aria-label={`Sort ${order === 'asc' ? 'ascending' : 'descending'}`}
      >
        {order === 'asc' ? '↑' : '↓'}
      </button>

      <input
        type="text"
        value={company}
        onChange={(e) => onChange({ company: e.target.value })}
        placeholder="search company…"
        aria-label="Search by company"
        className="min-w-0 flex-1 basis-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-fg placeholder:text-fg-3 sm:basis-40"
      />

      <span className="ml-2 text-[10px] uppercase tracking-widest text-fg-3">filter</span>
      <select
        value={status}
        onChange={(e) => onChange({ status: e.target.value as ApplicationStatus | '' })}
        aria-label="Filter by status"
        className="min-w-0 flex-1 basis-32 rounded-md border border-line bg-surface px-2.5 py-1.5 text-fg"
      >
        <option value="">all status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={source}
        onChange={(e) => onChange({ source: e.target.value })}
        aria-label="Filter by source"
        className="min-w-0 flex-1 basis-32 rounded-md border border-line bg-surface px-2.5 py-1.5 text-fg"
      >
        <option value="">all sources</option>
        {SOURCES.map((s) => (
          <option key={s} value={s}>{sourceLabel(s)}</option>
        ))}
      </select>
    </div>
  )
}
