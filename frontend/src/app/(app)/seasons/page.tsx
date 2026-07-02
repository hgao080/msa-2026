import Link from 'next/link'
import { getSeasons } from '@/lib/seasons'
import { getApplications } from '@/lib/applications'
import { formatDate } from '@/lib/date'
import { CloseSeason } from '@/components/seasons/CloseSeason'

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-display text-xl font-bold text-fg">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-fg-3">{label}</div>
    </div>
  )
}

export default async function SeasonHistoryPage() {
  const seasons = await getSeasons()
  const active = seasons.find((s) => s.status === 'Active')
  const archived = seasons
    .filter((s) => s.status === 'Archived')
    .sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''))

  let activeTotal = 0
  let activeThisWeek = 0
  if (active) {
    const apps = await getApplications(active.id)
    activeTotal = apps.length
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    activeThisWeek = apps.filter((a) => new Date(a.appliedDate) >= weekStart).length
  }

  return (
    <main className="animate-launch mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Seasons</h1>
        {active ? (
          <span
            className="cursor-not-allowed rounded-lg border border-line px-4 py-2 text-sm text-fg-3"
            title="Close the active season first"
          >
            Start new season
          </span>
        ) : (
          <Link href="/seasons/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
            Start new season
          </Link>
        )}
      </div>

      {active && (
        <section className="mb-8 rounded-xl border border-accent-soft bg-surface p-6" style={{ borderColor: 'var(--accent)' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-accent">Active</span>
              <h2 className="font-display text-xl font-bold text-fg">{active.name}</h2>
              {active.goal && <p className="mt-1 text-sm text-fg-2">{active.goal}</p>}
              <p className="mt-1 text-xs text-fg-3">Started {formatDate(active.startDate)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 hover:text-fg">
                Dashboard
              </Link>
              <CloseSeason seasonId={active.id} />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="applications" value={activeTotal} />
            <Stat label="this week" value={`${activeThisWeek}/${active.weeklyTarget}`} />
            <Stat label="weekly target" value={active.weeklyTarget} />
          </div>
        </section>
      )}

      <h2 className="mb-3 text-[10px] uppercase tracking-widest text-fg-3">Archived · {archived.length}</h2>
      {archived.length === 0 ? (
        <p className="text-sm text-fg-2">No archived seasons yet.</p>
      ) : (
        <div className="space-y-4">
          {archived.map((s) => (
            <div key={s.id} className="rounded-xl border border-line bg-surface p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-fg">{s.name}</h3>
                <span className="text-xs text-fg-3">
                  {formatDate(s.startDate)} – {formatDate(s.endDate)}
                </span>
              </div>
              {s.outcome && <p className="mt-1 text-sm text-fg-2">{s.outcome}</p>}
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Stat label="applications" value={s.finalApplicationCount ?? 0} />
                <Stat label="response rate" value={`${Math.round((s.finalResponseRate ?? 0) * 100)}%`} />
                <Stat label="interviews" value={s.finalInterviewCount ?? 0} />
                <Stat label="offers" value={s.finalOfferCount ?? 0} />
                <Stat label="best streak" value={`${s.finalStreakDays ?? 0}d`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
