import { describe, expect, it, vi, beforeEach } from 'vitest'
import { cookies } from 'next/headers'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

const { apiFetch, ApiError, query } = await import('./api')

function mockCookies(token?: string) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'token' && token ? { value: token } : undefined),
  } as unknown as Awaited<ReturnType<typeof cookies>>)
}

describe('query', () => {
  it('returns empty string for no params', () => {
    expect(query()).toBe('')
  })

  it('omits undefined values', () => {
    expect(query({ a: '1', b: undefined })).toBe('?a=1')
  })

  it('serializes multiple params', () => {
    expect(query({ a: '1', b: 2 })).toBe('?a=1&b=2')
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    mockCookies()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('attaches Authorization header when a token cookie is present', async () => {
    mockCookies('abc123')
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    await apiFetch('/api/x')

    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer abc123')
  })

  it('omits Authorization header when no token cookie is present', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    await apiFetch('/api/x')

    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('throws ApiError with status on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('nope', { status: 404 }))

    await expect(apiFetch('/api/missing')).rejects.toMatchObject({
      status: 404,
      message: expect.stringContaining('404'),
    })
    await expect(apiFetch('/api/missing')).rejects.toBeInstanceOf(ApiError)
  })

  it('returns undefined for 204 No Content', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiFetch('/api/deleted', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('parses JSON body for ok responses', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 200 }))

    await expect(apiFetch('/api/x')).resolves.toEqual({ id: 1 })
  })
})
