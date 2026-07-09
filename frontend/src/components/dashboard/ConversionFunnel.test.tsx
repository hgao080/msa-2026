import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ConversionFunnel } from './ConversionFunnel'
import type { FunnelStage } from '@/types'

function widths(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('div[style*="width"]')).map(
    (el) => el.style.width
  )
}

describe('ConversionFunnel', () => {
  it('sizes each bar relative to the max count', () => {
    const funnel: FunnelStage[] = [
      { stage: 'Applied', count: 10, conversionRate: null },
      { stage: 'OA', count: 5, conversionRate: 0.5 },
    ]
    const { container } = render(<ConversionFunnel funnel={funnel} />)
    expect(widths(container)).toEqual(['100%', '50%'])
  })

  it('floors max at 1 so an all-zero funnel does not divide by zero', () => {
    const funnel: FunnelStage[] = [{ stage: 'Applied', count: 0, conversionRate: null }]
    const { container } = render(<ConversionFunnel funnel={funnel} />)
    expect(widths(container)).toEqual(['0%'])
  })

  it('renders blank conversion rate when null, and a percentage otherwise', () => {
    const funnel: FunnelStage[] = [
      { stage: 'Applied', count: 10, conversionRate: null },
      { stage: 'OA', count: 5, conversionRate: 0.5 },
    ]
    const { getByText, container } = render(<ConversionFunnel funnel={funnel} />)
    expect(getByText('50%')).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/null/)
  })
})
