'use client'

import { useState, useTransition } from 'react'
import type { Application } from '@/types'
import { STATUS_COLOR } from '@/lib/status'
import {
  offerAction,
  unofferAction,
  withdrawAction,
  unwithdrawAction,
} from '@/app/(app)/applications/[id]/actions'
import type { ApplicationPatch } from './ApplicationDetail'

export function StatusControl({
  app,
  onOptimistic,
}: {
  app: Pick<Application, 'id' | 'status' | 'offeredAt' | 'withdrawnAt'>
  onOptimistic: (patch: ApplicationPatch) => void
}) {
  const { id, status, offeredAt, withdrawnAt } = app
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(patch: ApplicationPatch, action: () => Promise<void>) {
    setError(null)
    start(async () => {
      onOptimistic(patch)
      try {
        await action()
      } catch {
        setError('Failed to update.')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-semibold uppercase tracking-wide" style={{ color: STATUS_COLOR[status] }}>
        <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[status] }} />
        {status}
      </span>
      <button
        disabled={pending}
        onClick={() =>
          offeredAt
            ? run({ offeredAt: undefined }, () => unofferAction(id))
            : run({ offeredAt: new Date().toISOString() }, () => offerAction(id))
        }
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 hover:text-fg disabled:opacity-50"
      >
        {offeredAt ? 'Undo offer' : 'Mark offer'}
      </button>
      <button
        disabled={pending}
        onClick={() =>
          withdrawnAt
            ? run({ withdrawnAt: undefined }, () => unwithdrawAction(id))
            : run({ withdrawnAt: new Date().toISOString() }, () => withdrawAction(id))
        }
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 hover:text-fg disabled:opacity-50"
      >
        {withdrawnAt ? 'Reinstate' : 'Withdraw'}
      </button>
      {error && <p className="text-xs text-lose">{error}</p>}
    </div>
  )
}
