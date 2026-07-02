'use client'

import { useTransition } from 'react'
import type { ApplicationStatus } from '@/types'
import { STATUSES, STATUS_COLOR } from '@/lib/status'
import { patchStatusAction } from '@/app/(app)/applications/[id]/actions'

export function StatusControl({ id, status }: { id: string; status: ApplicationStatus }) {
  const [pending, start] = useTransition()

  return (
    <label className="inline-flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[status] }} />
      <select
        aria-label="Application status"
        value={status}
        disabled={pending}
        onChange={(e) =>
          start(() => {
            void patchStatusAction(id, e.target.value as ApplicationStatus)
          })
        }
        className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-semibold uppercase tracking-wide disabled:opacity-50"
        style={{ color: STATUS_COLOR[status] }}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="text-fg">{s}</option>
        ))}
      </select>
    </label>
  )
}
