import { apiFetch } from './api'
import type { DashboardData, Insight } from '@/types'

export const getDashboard = (seasonId: string) =>
  apiFetch<DashboardData>(`/api/seasons/${seasonId}/dashboard`)

export const getInsights = (seasonId: string) =>
  apiFetch<Insight[]>(`/api/seasons/${seasonId}/insights`)
