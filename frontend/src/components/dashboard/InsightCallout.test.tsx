import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InsightCallout } from './InsightCallout'
import type { Insight } from '@/types'

const KEY = 'horme-dismissed-insight'

describe('InsightCallout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the insight message by default', () => {
    const insight: Insight = { type: 'streak', message: 'Keep it up', priority: 1 }
    render(<InsightCallout insight={insight} />)
    expect(screen.getByText('Keep it up')).toBeInTheDocument()
  })

  it('dismisses and persists dismissal for that insight type', async () => {
    const user = userEvent.setup()
    const insight: Insight = { type: 'streak', message: 'Keep it up', priority: 1 }
    render(<InsightCallout insight={insight} />)

    await user.click(screen.getByLabelText('Dismiss insight'))

    expect(screen.queryByText('Keep it up')).not.toBeInTheDocument()
    expect(localStorage.getItem(KEY)).toBe('streak')
  })

  it('stays hidden on remount while the same type is dismissed', () => {
    localStorage.setItem(KEY, 'streak')
    const insight: Insight = { type: 'streak', message: 'Keep it up', priority: 1 }
    render(<InsightCallout insight={insight} />)
    expect(screen.queryByText('Keep it up')).not.toBeInTheDocument()
  })

  it('re-shows when a different insight type is dismissed', () => {
    localStorage.setItem(KEY, 'streak')
    const insight: Insight = { type: 'momentum', message: 'New insight', priority: 1 }
    render(<InsightCallout insight={insight} />)
    expect(screen.getByText('New insight')).toBeInTheDocument()
  })
})
