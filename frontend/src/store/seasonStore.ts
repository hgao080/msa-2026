import { create } from 'zustand'
import type { DashboardData, Season } from '../types'
import { getDashboard } from '../api/dashboard'

interface SeasonState {
  activeSeason: Season | null
  dashboard: DashboardData | null
  dashboardLoading: boolean
  setActiveSeason: (season: Season) => void
  loadDashboard: (seasonId: string) => Promise<void>
  invalidateDashboard: () => void
}

export const useSeasonStore = create<SeasonState>((set) => ({
  activeSeason: null,
  dashboard: null,
  dashboardLoading: false,
  setActiveSeason: (season) => set({ activeSeason: season }),
  loadDashboard: async (seasonId) => {
    set({ dashboardLoading: true })
    const data = await getDashboard(seasonId)
    set({ dashboard: data, dashboardLoading: false })
  },
  invalidateDashboard: () => set({ dashboard: null }),
}))
