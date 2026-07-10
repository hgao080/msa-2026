import type { FunnelStage } from '@/types'

export function ConversionFunnel({ funnel }: { funnel: FunnelStage[] }) {
  const max = Math.max(1, ...funnel.map((f) => f.count))

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface p-5">
      <h2 className="mb-4 text-[10px] uppercase tracking-widest text-fg-3">Conversion funnel</h2>
      <div className="flex flex-1 flex-col justify-center space-y-2.5">
        {funnel.map((f) => (
          <div key={f.stage} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs text-fg-2">{f.stage}</span>
            <div className="h-6 flex-1 overflow-hidden rounded bg-surface-2">
              <div
                className="h-full rounded"
                style={{
                  width: `${(f.count / max) * 100}%`,
                  minWidth: f.count > 0 ? '2px' : 0,
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-deep))',
                }}
              />
            </div>
            <span className="w-6 shrink-0 text-right font-display text-sm font-semibold tabular-nums text-fg">{f.count}</span>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-fg-3">
              {f.conversionRate == null ? '' : `${Math.round(f.conversionRate * 100)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
