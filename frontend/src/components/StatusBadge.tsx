import type { ApplicationStatus } from '@/types'
import { STATUS_COLOR } from '@/lib/status'

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
      style={{ color: STATUS_COLOR[status] }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: STATUS_COLOR[status] }}
      />
      {status}
    </span>
  )
}
