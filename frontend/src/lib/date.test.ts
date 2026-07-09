import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { relativeAge, formatDate } from './date'

describe('relativeAge', () => {
  const now = new Date('2026-01-31T00:00:00.000Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "today" for now or future timestamps', () => {
    expect(relativeAge(now.toISOString())).toBe('today')
    expect(relativeAge(new Date('2026-02-01').toISOString())).toBe('today')
  })

  it('returns "1d" for exactly one day ago', () => {
    expect(relativeAge(new Date('2026-01-30T00:00:00.000Z').toISOString())).toBe('1d')
  })

  it('returns days for 2-6 days ago', () => {
    expect(relativeAge(new Date('2026-01-25T00:00:00.000Z').toISOString())).toBe('6d')
  })

  it('returns weeks for 7-29 days ago', () => {
    expect(relativeAge(new Date('2026-01-24T00:00:00.000Z').toISOString())).toBe('1w')
    expect(relativeAge(new Date('2026-01-02T00:00:00.000Z').toISOString())).toBe('4w')
  })

  it('returns months for 30+ days ago', () => {
    expect(relativeAge(new Date('2025-12-31T00:00:00.000Z').toISOString())).toBe('1mo')
  })

  it('returns empty string for invalid input', () => {
    expect(relativeAge('not-a-date')).toBe('')
  })
})

describe('formatDate', () => {
  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('returns empty string for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  it('formats a valid ISO date', () => {
    expect(formatDate('2026-03-15T00:00:00.000Z')).toMatch(/2026/)
  })
})
