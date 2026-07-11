'use client'

import { useTransition } from 'react'
import type { ApplicationStatus } from '@/types'
import { STATUS_COLOR } from '@/lib/status'
import {
  offerAction,
  unofferAction,
  withdrawAction,
  unwithdrawAction,
} from '@/app/(app)/applications/[id]/actions'

export function StatusControl({
  id,
  status,
  offeredAt,
  withdrawnAt,
}: {
  id: string
  status: ApplicationStatus
  offeredAt?: string
  withdrawnAt?: string
}) {
  const [pending, start] = useTransition()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-semibold uppercase tracking-wide" style={{ color: STATUS_COLOR[status] }}>
        <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[status] }} />
        {status}
      </span>
      <button
        disabled={pending}
        onClick={() => start(() => void (offeredAt ? unofferAction(id) : offerAction(id)))}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 hover:text-fg disabled:opacity-50"
      >
        {offeredAt ? 'Undo offer' : 'Mark offer'}
      </button>
      <button
        disabled={pending}
        onClick={() => start(() => void (withdrawnAt ? unwithdrawAction(id) : withdrawAction(id)))}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 hover:text-fg disabled:opacity-50"
      >
        {withdrawnAt ? 'Reinstate' : 'Withdraw'}
      </button>
    </div>
  )
}
