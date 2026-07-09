import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BoardToolbar } from './BoardToolbar'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/board',
  useSearchParams: () => new URLSearchParams(),
}))

describe('BoardToolbar', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('marks the active sort button with aria-pressed', () => {
    render(<BoardToolbar />)
    expect(screen.getByRole('button', { name: 'Stage' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Age' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('pushes the new sort key when a sort button is clicked', async () => {
    const user = userEvent.setup()
    render(<BoardToolbar />)
    await user.click(screen.getByRole('button', { name: 'Age' }))
    expect(push).toHaveBeenCalledWith('/board?sort=appliedDate')
  })

  it('toggles sort order and its aria-label', async () => {
    const user = userEvent.setup()
    render(<BoardToolbar />)
    await user.click(screen.getByLabelText('Sort descending'))
    expect(push).toHaveBeenCalledWith('/board?order=asc')
  })

  it('debounces the company search before pushing', () => {
    vi.useFakeTimers()
    render(<BoardToolbar />)

    fireEvent.change(screen.getByLabelText('Search by company'), { target: { value: 'Acme' } })
    expect(push).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(push).toHaveBeenCalledWith('/board?company=Acme')

    vi.useRealTimers()
  })
})
