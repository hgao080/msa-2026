import { cookies } from 'next/headers'
import type { User } from '@/types'

const WEEK = 60 * 60 * 24 * 7

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: WEEK,
  }
}

export async function setSession(token: string, user: User) {
  const c = await cookies()
  c.set('token', token, cookieOptions())
  c.set('user', JSON.stringify(user), cookieOptions())
}

export async function clearSession() {
  const c = await cookies()
  c.delete('token')
  c.delete('user')
}

export async function getUser(): Promise<User | null> {
  const raw = (await cookies()).get('user')?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}
