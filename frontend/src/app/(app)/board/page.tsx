import Link from 'next/link'
import { getSeasons } from '@/lib/seasons'
import { getApplications } from '@/lib/applications'
import { ApplicationBoard } from '@/components/board/ApplicationBoard'

export default async function ApplicationBoardPage() {
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

  const apps = await getApplications(active.id)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <ApplicationBoard apps={apps} seasonId={active.id} seasonName={active.name} />
    </main>
  )
}
