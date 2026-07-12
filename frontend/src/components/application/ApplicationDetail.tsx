'use client'

import { useOptimistic } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { Application, ApplicationStage } from '@/types'
import { sourceLabel } from '@/lib/status'
import { formatDate } from '@/lib/date'
import { PipelineTrack } from '@/components/PipelineTrack'
import { StatusControl } from './StatusControl'
import { EditApplication } from './EditApplication'
import { StageTimeline } from './StageTimeline'

export type ApplicationPatch = Partial<Omit<Application, 'stages'>> & { stages?: ApplicationStage[] }

export function ApplicationDetail({ app }: { app: Application }) {
  const [optimisticApp, addOptimistic] = useOptimistic<Application, ApplicationPatch>(
    app,
    (current, patch) => ({ ...current, ...patch })
  )

  return (
    <main className="animate-launch mx-auto max-w-3xl px-4 py-8">
      <Link href="/board" className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg">
        <ArrowLeft size={15} /> Board
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">{optimisticApp.company}</h1>
          <p className="mt-0.5 text-fg-2">{optimisticApp.role}</p>
          <div className="mt-3">
            <PipelineTrack status={optimisticApp.status} stages={optimisticApp.stages} offeredAt={optimisticApp.offeredAt} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusControl app={optimisticApp} onOptimistic={addOptimistic} />
          <EditApplication app={optimisticApp} onOptimistic={addOptimistic} />
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-line bg-surface p-6 sm:grid-cols-3">
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-fg-3">Source</dt>
          <dd className="mt-1 text-sm text-fg">{sourceLabel(optimisticApp.source)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-fg-3">Applied</dt>
          <dd className="mt-1 text-sm text-fg">{formatDate(optimisticApp.appliedDate)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-fg-3">Last updated</dt>
          <dd className="mt-1 text-sm text-fg">{formatDate(optimisticApp.lastUpdated)}</dd>
        </div>
        {optimisticApp.referrerName && (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-fg-3">Referrer</dt>
            <dd className="mt-1 text-sm text-fg">{optimisticApp.referrerName}</dd>
          </div>
        )}
        {optimisticApp.jobPostingUrl && (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-[10px] uppercase tracking-widest text-fg-3">Job posting</dt>
            <dd className="mt-1 text-sm">
              <a href={optimisticApp.jobPostingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                {optimisticApp.jobPostingUrl} <ExternalLink size={13} />
              </a>
            </dd>
          </div>
        )}
        {optimisticApp.notes && (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-[10px] uppercase tracking-widest text-fg-3">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-fg-2">{optimisticApp.notes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-10">
        <StageTimeline appId={optimisticApp.id} stages={optimisticApp.stages ?? []} onOptimistic={addOptimistic} />
      </div>
    </main>
  )
}
