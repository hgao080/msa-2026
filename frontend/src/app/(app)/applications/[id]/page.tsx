import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getApplication } from '@/lib/applications'
import { sourceLabel } from '@/lib/status'
import { formatDate } from '@/lib/date'
import { PipelineTrack } from '@/components/PipelineTrack'
import { StatusControl } from '@/components/application/StatusControl'
import { EditApplication } from '@/components/application/EditApplication'
import { StageTimeline } from '@/components/application/StageTimeline'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const app = await getApplication(id)

  return (
    <main className="animate-launch mx-auto max-w-3xl px-4 py-8">
      <Link href="/board" className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-fg">
        <ArrowLeft size={15} /> Board
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">{app.company}</h1>
          <p className="mt-0.5 text-fg-2">{app.role}</p>
          <div className="mt-3">
            <PipelineTrack status={app.status} stages={app.stages} offeredAt={app.offeredAt} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusControl id={app.id} status={app.status} offeredAt={app.offeredAt} withdrawnAt={app.withdrawnAt} />
          <EditApplication app={app} />
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-line bg-surface p-6 sm:grid-cols-3">
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-fg-3">Source</dt>
          <dd className="mt-1 text-sm text-fg">{sourceLabel(app.source)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-fg-3">Applied</dt>
          <dd className="mt-1 text-sm text-fg">{formatDate(app.appliedDate)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-widest text-fg-3">Last updated</dt>
          <dd className="mt-1 text-sm text-fg">{formatDate(app.lastUpdated)}</dd>
        </div>
        {app.referrerName && (
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-fg-3">Referrer</dt>
            <dd className="mt-1 text-sm text-fg">{app.referrerName}</dd>
          </div>
        )}
        {app.jobPostingUrl && (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-[10px] uppercase tracking-widest text-fg-3">Job posting</dt>
            <dd className="mt-1 text-sm">
              <a href={app.jobPostingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                {app.jobPostingUrl} <ExternalLink size={13} />
              </a>
            </dd>
          </div>
        )}
        {app.notes && (
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-[10px] uppercase tracking-widest text-fg-3">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-fg-2">{app.notes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-10">
        <StageTimeline appId={app.id} stages={app.stages ?? []} />
      </div>
    </main>
  )
}
