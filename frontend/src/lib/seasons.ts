import { apiFetch } from './api'
import type { Season } from '@/types'

export const getSeasons = () => apiFetch<Season[]>('/api/seasons')

export const getSeason = (id: string) => apiFetch<Season>(`/api/seasons/${id}`)

export const createSeason = (data: { name: string; goal?: string; weeklyTarget: number }) =>
  apiFetch<Season>('/api/seasons', { method: 'POST', body: JSON.stringify(data) })

export const updateSeason = (
  id: string,
  data: { name?: string; goal?: string; weeklyTarget?: number }
) => apiFetch<Season>(`/api/seasons/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const closeSeason = (id: string, outcome?: string) =>
  apiFetch<Season>(`/api/seasons/${id}/close`, { method: 'POST', body: JSON.stringify({ outcome }) })
