import Link from 'next/link'
import { getSeasons } from '@/lib/seasons'
import { getApplications } from '@/lib/applications'
import type { ApplicationStatus } from '@/types'
import { BoardToolbar } from '@/components/board/BoardToolbar'
import { AddApplication } from '@/components/board/AddApplication'
import { ApplicationRow } from '@/components/ApplicationRow'

export default async function ApplicationBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; sort?: string; order?: string; company?: string }>
}) {
  const sp = await searchParams
  const seasons = await getSeasons()
  const active = seasons.find((s) => s.status === 'Active')

  if (!active) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-fg">No active season</h1>
        <p className="mt-2 text-sm text-fg-2">Start a season to begin tracking applications.</p>
        <Link
          href="/seasons/new"
          className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"
        >
          Start a season
        </Link>
      </main>
    )
  }

  const apps = await getApplications(active.id, {
    status: (sp.status as ApplicationStatus) || undefined,
    source: sp.source || undefined,
    sort: sp.sort || 'pipeline',
    order: sp.order || 'desc',
    company: sp.company || undefined,
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="animate-launch mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-fg">
            {active.name} <span className="font-mono text-sm font-normal text-fg-3">// {apps.length} application{apps.length === 1 ? '' : 's'}</span>
          </h1>
        </div>
        <AddApplication seasonId={active.id} />
      </div>

      <BoardToolbar />

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-16 text-center">
          <p className="text-sm text-fg-2">No applications match yet.</p>
          <p className="mt-1 text-xs text-fg-3">Log your first one to get the momentum going.</p>
        </div>
      ) : (
        <div className="animate-launch overflow-hidden rounded-xl border border-line bg-surface">
          <div className="grid grid-cols-[4px_1.3fr_120px_150px_110px_120px] gap-3.5 border-b border-line px-4 py-3 text-[10px] uppercase tracking-widest text-fg-3 max-[640px]:hidden">
            <span />
            <span>Company / Role</span>
            <span>Source</span>
            <span>Pipeline</span>
            <span>Stage</span>
            <span className="text-right">Age / Updated</span>
          </div>
          {apps.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </div>
      )}
    </main>
  )
}
