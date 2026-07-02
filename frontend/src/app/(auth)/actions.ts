'use server'

import { redirect } from 'next/navigation'
import { BASE } from '@/lib/api'
import { setSession, clearSession } from '@/lib/session'
import type { User } from '@/types'

interface AuthResponse {
  token: string
  user: User
}

export interface ActionState {
  error?: string
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) return { error: 'Invalid email or password' }

  const { token, user } = (await res.json()) as AuthResponse
  await setSession(token, user)
  redirect('/dashboard')
}

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email'))
  const username = String(formData.get('username'))
  const password = String(formData.get('password'))

  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  })

  if (!res.ok) return { error: 'Registration failed. Email may already be in use.' }

  const { token, user } = (await res.json()) as AuthResponse
  await setSession(token, user)
  redirect('/seasons/new')
}

export async function logout() {
  await clearSession()
  redirect('/login')
}
