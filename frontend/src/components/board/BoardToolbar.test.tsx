import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BoardToolbar, type BoardFilters } from './BoardToolbar'

const baseFilters: BoardFilters = { sort: 'pipeline', order: 'desc', status: '', source: '', company: '' }

describe('BoardToolbar', () => {
  it('marks the active sort button with aria-pressed', () => {
    render(<BoardToolbar filters={baseFilters} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Stage' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Age' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with the new sort key when a sort button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BoardToolbar filters={baseFilters} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Age' }))
    expect(onChange).toHaveBeenCalledWith({ sort: 'appliedDate' })
  })

  it('toggles sort order and its aria-label', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BoardToolbar filters={baseFilters} onChange={onChange} />)
    await user.click(screen.getByLabelText('Sort descending'))
    expect(onChange).toHaveBeenCalledWith({ order: 'asc' })
  })

  it('calls onChange as the company search is typed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BoardToolbar filters={baseFilters} onChange={onChange} />)
    await user.type(screen.getByLabelText('Search by company'), 'A')
    expect(onChange).toHaveBeenCalledWith({ company: 'A' })
  })
})
