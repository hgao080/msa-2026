'use client'

import { useMemo, useState } from 'react'
import { BoardToolbar, type BoardFilters } from './BoardToolbar'
import { AddApplication } from './AddApplication'
import { ApplicationRow } from '@/components/ApplicationRow'
import { pipelineLevel } from '@/lib/status'
import type { Application } from '@/types'

const DEFAULT_FILTERS: BoardFilters = { sort: 'pipeline', order: 'desc', status: '', source: '', company: '' }

function sortApps(apps: Application[], { sort, order }: BoardFilters) {
  const dir = order === 'asc' ? 1 : -1
  const sorted = [...apps]

  switch (sort) {
    case 'lastUpdated':
      return sorted.sort((a, b) => dir * a.lastUpdated.localeCompare(b.lastUpdated))
    case 'appliedDate':
      return sorted.sort((a, b) => dir * a.appliedDate.localeCompare(b.appliedDate))
    default:
      return sorted.sort((a, b) => {
        const rejected = Number(a.status === 'Rejected') - Number(b.status === 'Rejected')
        if (rejected !== 0) return rejected
        return dir * (pipelineLevel(a) - pipelineLevel(b))
      })
  }
}

export function ApplicationBoard({ apps, seasonId, seasonName }: { apps: Application[]; seasonId: string; seasonName: string }) {
  const [filters, setFilters] = useState<BoardFilters>(DEFAULT_FILTERS)

  const visible = useMemo(() => {
    const filtered = apps.filter((a) => {
      if (filters.status && a.status !== filters.status) return false
      if (filters.source && a.source !== filters.source) return false
      if (filters.company && !a.company.toLowerCase().includes(filters.company.toLowerCase())) return false
      return true
    })
    return sortApps(filtered, filters)
  }, [apps, filters])

  return (
    <>
      <div className="animate-launch mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-fg">
            {seasonName} <span className="font-mono text-sm font-normal text-fg-3">// {visible.length} application{visible.length === 1 ? '' : 's'}</span>
          </h1>
        </div>
        <AddApplication seasonId={seasonId} />
      </div>

      <BoardToolbar filters={filters} onChange={(next) => setFilters((f) => ({ ...f, ...next }))} />

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-16 text-center">
          <p className="text-sm text-fg-2">No applications match yet.</p>
          <p className="mt-1 text-xs text-fg-3">Log your first one to get the momentum going.</p>
        </div>
      ) : (
        <div className="animate-launch overflow-hidden rounded-xl border border-line bg-surface">
          <div className="grid grid-cols-[4px_1.3fr_120px_150px_110px_120px] gap-3.5 border-b border-line px-4 py-3 text-[10px] uppercase tracking-widest text-fg-3 max-[901px]:grid-cols-[4px_1fr_110px_120px] max-[640px]:hidden">
            <span />
            <span>Company / Role</span>
            <span className="max-[901px]:hidden">Source</span>
            <span className="max-[901px]:hidden">Pipeline</span>
            <span>Stage</span>
            <span className="text-right">Age / Updated</span>
          </div>
          {visible.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </div>
      )}
    </>
  )
}
