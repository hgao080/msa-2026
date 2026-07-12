import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatusControl } from './StatusControl'

vi.mock('@/app/(app)/applications/[id]/actions', () => ({
  offerAction: vi.fn().mockResolvedValue(undefined),
  unofferAction: vi.fn().mockResolvedValue(undefined),
  withdrawAction: vi.fn().mockResolvedValue(undefined),
  unwithdrawAction: vi.fn().mockResolvedValue(undefined),
}))

const actions = await import('@/app/(app)/applications/[id]/actions')

describe('StatusControl', () => {
  it('shows "Mark offer" and "Withdraw" when neither offered nor withdrawn', () => {
    render(<StatusControl app={{ id: 'app-1', status: 'Applied' }} onOptimistic={vi.fn()} />)
    expect(screen.getByText('Mark offer')).toBeInTheDocument()
    expect(screen.getByText('Withdraw')).toBeInTheDocument()
  })

  it('calls offerAction with the application id when marking an offer', async () => {
    const user = userEvent.setup()
    render(<StatusControl app={{ id: 'app-1', status: 'Applied' }} onOptimistic={vi.fn()} />)
    await user.click(screen.getByText('Mark offer'))
    expect(actions.offerAction).toHaveBeenCalledWith('app-1')
  })

  it('shows "Undo offer" and calls unofferAction once offered', async () => {
    const user = userEvent.setup()
    render(<StatusControl app={{ id: 'app-1', status: 'Offer', offeredAt: '2026-01-01' }} onOptimistic={vi.fn()} />)
    await user.click(screen.getByText('Undo offer'))
    expect(actions.unofferAction).toHaveBeenCalledWith('app-1')
  })

  it('shows "Reinstate" and calls unwithdrawAction once withdrawn', async () => {
    const user = userEvent.setup()
    render(<StatusControl app={{ id: 'app-1', status: 'Withdrawn', withdrawnAt: '2026-01-01' }} onOptimistic={vi.fn()} />)
    await user.click(screen.getByText('Reinstate'))
    expect(actions.unwithdrawAction).toHaveBeenCalledWith('app-1')
  })

  it('calls withdrawAction with the application id when withdrawing', async () => {
    const user = userEvent.setup()
    render(<StatusControl app={{ id: 'app-1', status: 'Applied' }} onOptimistic={vi.fn()} />)
    await user.click(screen.getByText('Withdraw'))
    expect(actions.withdrawAction).toHaveBeenCalledWith('app-1')
  })

  it('calls onOptimistic with the optimistic patch before the action resolves', async () => {
    const user = userEvent.setup()
    const onOptimistic = vi.fn()
    render(<StatusControl app={{ id: 'app-1', status: 'Applied' }} onOptimistic={onOptimistic} />)
    await user.click(screen.getByText('Mark offer'))
    expect(onOptimistic).toHaveBeenCalledWith({ offeredAt: expect.any(String) })
  })
})
