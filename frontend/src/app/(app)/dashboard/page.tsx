import Link from 'next/link'
import { getSeasons } from '@/lib/seasons'
import { getDashboard } from '@/lib/dashboard'
import { getApplications } from '@/lib/applications'
import { MomentumCurve } from '@/components/dashboard/MomentumCurve'
import { ConversionFunnel } from '@/components/dashboard/ConversionFunnel'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { InsightCallout } from '@/components/dashboard/InsightCallout'
import { MilestoneList } from '@/components/dashboard/MilestoneList'

function Readout({
  value,
  label,
  sub,
  accent,
}: {
  value: string
  label: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className={`font-display text-2xl font-bold ${accent ? 'text-accent' : 'text-fg'}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-fg-3">{label}</div>
      {sub && (
        <div className="mt-1.5 text-[10px] text-fg-3">
          <span className="text-accent" style={{ transform: 'skewX(-12deg)', display: 'inline-block' }} aria-hidden>
            ´
          </span>{' '}
          {sub}
        </div>
      )}
    </div>
  )
}

function buildMomentum(startDate: string, dates: string[]) {
  const start = new Date(startDate).getTime()
  const weeks = Math.max(1, Math.ceil((Date.now() - start) / (7 * 86_400_000)))
  const perWeek = new Array(weeks).fill(0)
  for (const d of dates) {
    const w = Math.floor((new Date(d).getTime() - start) / (7 * 86_400_000))
    if (w >= 0 && w < weeks) perWeek[w]++
  }
  let cum = 0
  return perWeek.map((c, i) => {
    cum += c
    return { label: `W${i + 1}`, value: cum }
  })
}

export default async function DashboardPage() {
  const seasons = await getSeasons()
  const active = seasons.find((s) => s.status === 'Active')

  if (!active) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-fg">No active season</h1>
        <p className="mt-2 text-sm text-fg-2">Start a season to see your momentum.</p>
        <Link href="/seasons/new" className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white">
          Start a season
        </Link>
      </main>
    )
  }

  const [dash, apps] = await Promise.all([getDashboard(active.id), getApplications(active.id)])
  const { stats } = dash
  const momentum = buildMomentum(active.startDate, apps.map((a) => a.appliedDate))

  return (
    <main className="animate-launch mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-accent">Active season</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">{active.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Readout value={String(stats.totalApplications)} label="applications" />
        <Readout value={`${stats.weeklyProgress}/${stats.weeklyTarget}`} label="this week" />
        <Readout
          value={`${stats.currentStreak}d`}
          label="streak · momentum"
          sub={stats.longestStreak > stats.currentStreak ? `best ${stats.longestStreak}d` : undefined}
          accent
        />
        <Readout value={`${Math.round(stats.responseRate * 100)}%`} label="response rate" />
        <Readout value={String(stats.totalInterviews)} label="interview rounds" />
      </div>

      {dash.topInsight && <InsightCallout insight={dash.topInsight} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <MomentumCurve points={momentum} bestWeek={stats.personalBests.bestWeekApplications} />
        <ActivityHeatmap heatmap={dash.heatmap} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ConversionFunnel funnel={dash.funnel} />
        <MilestoneList milestones={dash.milestones} />
      </div>
    </main>
  )
}
