import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MilestoneList } from './MilestoneList'
import type { MilestoneStatus } from '@/types'

const milestones: MilestoneStatus[] = [
  {
    milestone: { id: '1', slug: 'first-app', name: 'First application', description: '' },
    unlockedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    milestone: { id: '2', slug: 'ten-apps', name: 'Ten applications', description: '' },
    unlockedAt: null,
  },
]

describe('MilestoneList', () => {
  it('shows the unlocked/total count in the header', () => {
    render(<MilestoneList milestones={milestones} />)
    expect(screen.getByText('Milestones · 1/2')).toBeInTheDocument()
  })

  it('shows the unlock date only for unlocked milestones', () => {
    render(<MilestoneList milestones={milestones} />)
    expect(screen.getByText('First application')).toBeInTheDocument()
    expect(screen.getByText('Ten applications')).toBeInTheDocument()
    // one date rendered (for the unlocked milestone), none for the locked one
    expect(screen.getAllByText(/2026/)).toHaveLength(1)
  })
})
