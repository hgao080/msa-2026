import client from './client'
import type { Season } from '../types'

export const getSeasons = () =>
  client.get<Season[]>('/api/seasons').then(r => r.data)

export const getSeason = (id: string) =>
  client.get<Season>(`/api/seasons/${id}`).then(r => r.data)

export const createSeason = (data: { name: string; goal?: string; weeklyTarget: number }) =>
  client.post<Season>('/api/seasons', data).then(r => r.data)

export const updateSeason = (id: string, data: { name?: string; goal?: string; weeklyTarget?: number }) =>
  client.put<Season>(`/api/seasons/${id}`, data).then(r => r.data)

export const closeSeason = (id: string, outcome?: string) =>
  client.post<Season>(`/api/seasons/${id}/close`, { outcome }).then(r => r.data)
