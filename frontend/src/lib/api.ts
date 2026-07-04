import { cookies } from 'next/headers'

export const BASE = process.env.HORME_API_URL ?? 'http://localhost:5210'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

type Query = Record<string, string | number | undefined>

function toQuery(params?: Query): string {
  if (!params) return ''
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = (await cookies()).get('token')?.value
  const res = await fetch(`${BASE}${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    throw new ApiError(res.status, `${init?.method ?? 'GET'} ${path} failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const query = toQuery
