import Link from 'next/link'
import type { Application } from '@/types'
import { STATUS_COLOR, sourceLabel } from '@/lib/status'
import { relativeAge } from '@/lib/date'
import { PipelineTrack } from './PipelineTrack'

const muted = (s: Application['status']) => s === 'Rejected' || s === 'Withdrawn'

export function ApplicationRow({ app }: { app: Application }) {
  return (
    <Link
      href={`/applications/${app.id}`}
      className="grid grid-cols-[4px_1.6fr_120px_150px_110px_56px] items-center gap-3.5 border-b border-line px-4 py-3 transition-transform last:border-b-0 hover:translate-x-1.5 hover:bg-[var(--row-hi)] focus-visible:outline-2 focus-visible:outline-accent max-[640px]:grid-cols-[4px_1fr_auto] max-[640px]:gap-x-3"
      style={{ ['--st' as string]: STATUS_COLOR[app.status] }}
    >
      <span
        className="h-full self-stretch rounded-sm max-[640px]:row-span-3"
        style={{ background: STATUS_COLOR[app.status], boxShadow: `0 0 10px color-mix(in srgb, ${STATUS_COLOR[app.status]} 50%, transparent)` }}
      />
      <span className="min-w-0">
        <span className={`block truncate font-display text-[15px] font-semibold ${muted(app.status) ? 'text-fg-2' : 'text-fg'}`}>
          {app.company}
        </span>
        <span className="block truncate text-[11.5px] text-fg-2">{app.role}</span>
      </span>
      <span className="text-xs text-fg-2 max-[640px]:hidden">
        <span className="text-fg-3">› </span>{sourceLabel(app.source)}
      </span>
      <span className="max-[640px]:hidden">
        <PipelineTrack status={app.status} stages={app.stages} offeredAt={app.offeredAt} />
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide max-[640px]:justify-self-end" style={{ color: STATUS_COLOR[app.status] }}>
        {app.status}
      </span>
      <span className="text-right text-xs tabular-nums text-fg-3 max-[640px]:justify-self-end">
        {relativeAge(app.appliedDate)}
      </span>
    </Link>
  )
}
