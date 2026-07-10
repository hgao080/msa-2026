interface Day {
  date: string
  active: boolean
}

export function ActivityHeatmap({ heatmap }: { heatmap: Day[] }) {
  // pad leading cells so the first column aligns to the day of week
  const lead = heatmap.length ? new Date(heatmap[0].date).getDay() : 0

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface p-5">
      <h2 className="mb-4 text-[10px] uppercase tracking-widest text-fg-3">Activity</h2>
      <div className="flex flex-1 items-center justify-center gap-2">
        <div className="grid grid-rows-7 gap-[3px] pt-[1px] text-[9px] text-fg-3">
          <span>M</span><span /><span>W</span><span /><span>F</span><span /><span />
        </div>
        <div
          className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto"
          role="img"
          aria-label={`${heatmap.filter((d) => d.active).length} active days this season`}
        >
          {Array.from({ length: lead }).map((_, i) => (
            <span key={`lead-${i}`} className="h-3 w-3" />
          ))}
          {heatmap.map((d) => (
            <span
              key={d.date}
              title={d.date}
              className="h-3 w-3 rounded-[3px]"
              style={
                d.active
                  ? { background: 'var(--accent)' }
                  : { border: '1px solid var(--line)' }
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
