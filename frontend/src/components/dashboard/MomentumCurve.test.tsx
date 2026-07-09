import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MomentumCurve } from './MomentumCurve'

describe('MomentumCurve', () => {
  it('shows the last point value as the total', () => {
    render(
      <MomentumCurve
        points={[
          { label: 'W1', value: 2 },
          { label: 'W2', value: 7 },
        ]}
      />
    )
    expect(screen.getByText('↗ 7 total')).toBeInTheDocument()
  })

  it('shows 0 total for an empty series', () => {
    render(<MomentumCurve points={[]} />)
    expect(screen.getByText('↗ 0 total')).toBeInTheDocument()
  })

  it('does not divide by zero with a single point', () => {
    render(<MomentumCurve points={[{ label: 'W1', value: 4 }]} />)
    const path = screen.getByRole('img', { name: /cumulative applications/i })
    expect(path.querySelector('path')).toBeInTheDocument()
    expect(screen.getByText('↗ 4 total')).toBeInTheDocument()
  })
})
