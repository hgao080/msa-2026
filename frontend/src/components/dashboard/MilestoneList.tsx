import { Trophy, Lock } from 'lucide-react'
import type { MilestoneStatus } from '@/types'
import { formatDate } from '@/lib/date'

export function MilestoneList({ milestones }: { milestones: MilestoneStatus[] }) {
  const unlocked = milestones.filter((m) => m.unlockedAt).length

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="mb-4 text-[10px] uppercase tracking-widest text-fg-3">
        Milestones · {unlocked}/{milestones.length}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {milestones.map(({ milestone, unlockedAt }) => {
          const on = Boolean(unlockedAt)
          return (
            <div
              key={milestone.id}
              className={`flex items-start gap-2.5 rounded-lg border p-3 ${on ? 'border-accent-soft bg-accent-soft' : 'border-line opacity-60'}`}
              style={on ? { borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)' } : undefined}
            >
              {on ? <Trophy size={16} className="mt-0.5 shrink-0 text-accent" /> : <Lock size={16} className="mt-0.5 shrink-0 text-fg-3" />}
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${on ? 'text-fg' : 'text-fg-2'}`}>{milestone.name}</p>
                {on && <p className="mt-0.5 text-[10px] text-fg-3">{formatDate(unlockedAt!)}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
