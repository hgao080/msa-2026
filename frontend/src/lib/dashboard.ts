import { apiFetch } from './api'
import type { DashboardData } from '@/types'

export const getDashboard = (seasonId: string) =>
  apiFetch<DashboardData>(`/api/seasons/${seasonId}/dashboard`)
