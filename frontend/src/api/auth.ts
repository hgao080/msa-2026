import client from './client'
import type { User } from '../types'

export interface AuthResponse {
  token: string
  user: User
}

export const register = (email: string, username: string, password: string) =>
  client.post<AuthResponse>('/api/auth/register', { email, username, password }).then(r => r.data)

export const login = (email: string, password: string) =>
  client.post<AuthResponse>('/api/auth/login', { email, password }).then(r => r.data)

export const refresh = () =>
  client.post<AuthResponse>('/api/auth/refresh').then(r => r.data)
