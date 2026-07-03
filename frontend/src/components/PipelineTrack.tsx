import type { Application, ApplicationStatus } from '@/types'
import { STATUS_COLOR, pipelineLevel } from '@/lib/status'

export function PipelineTrack({
  status,
  stages,
  offeredAt,
}: {
  status: ApplicationStatus
  stages: Application['stages']
  offeredAt?: Application['offeredAt']
}) {
  const level = pipelineLevel({ stages, offeredAt })
  const color = STATUS_COLOR[status]

  return (
    <div className="flex items-center" aria-label={`Pipeline stage ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const nodeOn = i < level
        const segOn = i + 1 < level
        return (
          <div key={i} className="flex items-center">
            <span
              className="h-[7px] w-[7px] rounded-full"
              style={{
                background: nodeOn ? color : 'var(--line)',
                boxShadow: nodeOn ? `0 0 6px color-mix(in srgb, ${color} 65%, transparent)` : 'none',
              }}
            />
            {i < 4 && (
              <span
                className="h-[2px] w-4"
                style={{ background: segOn ? color : 'var(--line)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
