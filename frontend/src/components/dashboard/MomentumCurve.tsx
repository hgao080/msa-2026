interface Point {
  label: string
  value: number
}

const W = 560
const H = 170
const PAD = 10

export function MomentumCurve({ points }: { points: Point[] }) {
  const max = Math.max(1, ...points.map((p) => p.value))
  const n = Math.max(points.length, 2)

  const xy = points.map((p, i) => {
    const x = PAD + (i / (n - 1)) * (W - PAD * 2)
    const y = H - PAD - (p.value / max) * (H - PAD * 2)
    return [x, y] as const
  })

  const line = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${(W - PAD).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-widest text-fg-3">Season momentum</span>
        <span className="font-display text-sm font-semibold text-fg">↗ {points.at(-1)?.value ?? 0} total</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Cumulative applications over the season">
        <defs>
          <linearGradient id="mc-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: 'var(--accent)' }} />
            <stop offset="1" style={{ stopColor: 'var(--accent-deep)' }} />
          </linearGradient>
          <linearGradient id="mc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0.16 }} />
            <stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#mc-fill)" />
        <path d={line} fill="none" stroke="url(#mc-stroke)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="curve-draw" />
        {xy.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === xy.length - 1 ? 5 : 3.5} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-fg-3">
        {points.map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </div>
  )
}
