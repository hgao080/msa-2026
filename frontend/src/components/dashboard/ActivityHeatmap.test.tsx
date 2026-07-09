import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityHeatmap } from './ActivityHeatmap'

describe('ActivityHeatmap', () => {
  it('reports the active day count in the aria-label', () => {
    const heatmap = [
      { date: '2026-01-05', active: true },
      { date: '2026-01-06', active: false },
      { date: '2026-01-07', active: true },
    ]
    render(<ActivityHeatmap heatmap={heatmap} />)
    expect(screen.getByRole('img', { name: '2 active days this season' })).toBeInTheDocument()
  })

  it('pads leading cells to align the first day to its weekday column', () => {
    const date = '2026-01-07'
    const expectedLead = new Date(date).getDay()
    const heatmap = [{ date, active: true }]
    render(<ActivityHeatmap heatmap={heatmap} />)
    const grid = screen.getByRole('img')
    const dayCells = grid.querySelectorAll('span[title]')
    const leadCells = grid.querySelectorAll('span:not([title])')
    expect(dayCells).toHaveLength(1)
    expect(leadCells).toHaveLength(expectedLead)
  })

  it('renders no lead padding or crash for an empty heatmap', () => {
    render(<ActivityHeatmap heatmap={[]} />)
    expect(screen.getByRole('img', { name: '0 active days this season' })).toBeInTheDocument()
  })
})
