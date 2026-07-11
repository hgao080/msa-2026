import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MomentumCurve } from '@/components/dashboard/MomentumCurve'
import { PipelineTrack } from '@/components/PipelineTrack'
import { STATUS_COLOR } from '@/lib/status'
import type { ApplicationStage, ApplicationStatus } from '@/types'

const CURVE_POINTS = [
  { label: 'wk 1', value: 2 },
  { label: 'wk 2', value: 6 },
  { label: 'wk 3', value: 11 },
  { label: 'wk 4', value: 17 },
]

const READOUTS = [
  { value: '17', suffix: '', label: 'applications logged' },
  { value: '5', suffix: '/6', label: 'this week' },
  { value: '9', suffix: 'd', label: 'current streak' },
  { value: '47', suffix: '%', label: 'response rate' },
]

const PILLARS = [
  {
    title: 'Run a season',
    body: "Set a weekly target and a goal, then start the clock. Close it when you land the role — final stats freeze so the history stays honest.",
  },
  {
    title: 'Move the pipeline',
    body: 'Every application sits at one of five stages, Applied through Offer. The board is a ledger, not a wall of cards, so status is a glance, not a scroll.',
  },
  {
    title: 'Keep the momentum',
    body: "Streaks, milestones, and insights drawn from your own numbers — like ‘referrals convert 3× better than LinkedIn for you’ — not arbitrary points.",
  },
]

const stage = (type: ApplicationStage['type']): ApplicationStage => ({
  id: type,
  applicationId: '',
  type,
  status: 'Completed',
})

const PREVIEW_ROWS: {
  company: string
  role: string
  status: ApplicationStatus
  stages: ApplicationStage[]
  offeredAt?: string
  age: string
}[] = [
  { company: 'Google', role: 'STEP Intern', status: 'Offer', stages: [stage('OA'), stage('Technical'), stage('Behavioural')], offeredAt: '2026-06-01', age: '20d' },
  { company: 'Canva', role: 'Frontend Engineer Intern', status: 'Technical', stages: [stage('OA'), stage('Technical')], age: '12d' },
  { company: 'Atlassian', role: 'Software Engineer Intern', status: 'PhoneScreen', stages: [stage('PhoneScreen')], age: '5d' },
  { company: 'Xero', role: 'Grad Software Engineer', status: 'Applied', stages: [], age: '2d' },
  { company: 'CommBank', role: 'Data Engineer Intern', status: 'Rejected', stages: [stage('OA')], age: '15d' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <span
            className="inline-block font-display text-xl font-bold tracking-tight text-accent"
            style={{ transform: 'skewX(-8deg)' }}
          >
            HORME
          </span>
          <nav className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-fg-2 hover:text-fg">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-accent-deep"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-line px-4 pb-10 pt-14 sm:pt-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="animate-launch">
            <p className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-accent">
              <span className="h-[2px] w-5 bg-accent" aria-hidden />
              the impulse to act
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-5xl">
              Your job hunt has <span className="text-accent">momentum</span>. Start tracking it.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-2">
              Horme treats your job search as a <b className="text-fg">season</b> — every application
              logged, moved through a five-stage pipeline, and turned into streaks, milestones, and
              insights pulled from your own data.
            </p>
            <p className="mt-2 text-xs text-fg-3">
              ὁρμή · <i>hor·mē</i> · Gk. the onset of motion, the drive toward a goal
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_var(--accent)] hover:bg-accent-deep"
              >
                Start your season
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-fg-2 hover:text-fg"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="animate-launch" style={{ animationDelay: '0.12s' }}>
            <MomentumCurve points={CURVE_POINTS} bestWeek={17} />
            <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-fg-3">
              example season · not your data
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line px-4 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-xl border border-line sm:grid-cols-4 sm:divide-y-0">
          {READOUTS.map((r) => (
            <div key={r.label} className="bg-surface p-4">
              <div className="font-display text-2xl font-bold text-fg">
                {r.value}
                <small className="text-sm font-medium text-fg-3">{r.suffix}</small>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-fg-3">{r.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-semibold text-fg">Log. Track. Learn.</h2>
          <p className="mt-2 max-w-lg text-sm text-fg-2">
            The order you&apos;d actually use it in — a season for structure, a board for state, insights
            for what to do next.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="rounded-xl border border-line bg-surface p-5">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <h3 className="mt-3 font-display text-base font-semibold text-fg">{p.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-2">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface-2 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-fg">The board</h2>
            <span className="font-mono text-[11px] uppercase tracking-wider text-fg-3">
              example season · 5 in play
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {PREVIEW_ROWS.map((row) => (
              <div
                key={row.company}
                className="grid grid-cols-[4px_1.3fr_140px_110px_70px] items-center gap-3.5 border-b border-line px-4 py-3 last:border-b-0 max-[640px]:grid-cols-[4px_1fr_auto]"
              >
                <span
                  className="h-full self-stretch rounded-sm"
                  style={{ background: STATUS_COLOR[row.status] }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate font-display text-[15px] font-semibold text-fg">
                    {row.company}
                  </span>
                  <span className="block truncate text-[11.5px] text-fg-2">{row.role}</span>
                </span>
                <span className="max-[640px]:hidden">
                  <PipelineTrack status={row.status} stages={row.stages} offeredAt={row.offeredAt} />
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-wide max-[640px]:justify-self-end"
                  style={{ color: STATUS_COLOR[row.status] }}
                >
                  {row.status}
                </span>
                <span className="text-right text-xs tabular-nums text-fg-3 max-[640px]:hidden">
                  {row.age}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-fg sm:text-3xl">
          Ready to build momentum?
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-fg-2">
          Free to use. Takes under a minute to set up.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_var(--accent)] hover:bg-accent-deep"
        >
          Start your season
        </Link>
      </section>

      <footer className="border-t border-line px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 text-center">
          <span
            className="inline-block font-display text-sm font-bold text-accent"
            style={{ transform: 'skewX(-8deg)' }}
          >
            HORME
          </span>
          <p className="text-xs text-fg-3">Horme · keep the momentum</p>
        </div>
      </footer>
    </div>
  )
}
