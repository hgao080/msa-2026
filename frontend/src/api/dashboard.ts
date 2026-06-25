import client from './client'
import type { DashboardData, Insight } from '../types'

export const getDashboard = (seasonId: string) =>
  client.get<DashboardData>(`/api/seasons/${seasonId}/dashboard`).then(r => r.data)

export const getInsights = (seasonId: string) =>
  client.get<Insight[]>(`/api/seasons/${seasonId}/insights`).then(r => r.data)
