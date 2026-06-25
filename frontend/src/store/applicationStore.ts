import { create } from 'zustand'
import type { Application, ApplicationStatus } from '../types'
import { getApplications } from '../api/applications'

interface ApplicationState {
  applications: Application[]
  loading: boolean
  filters: { status?: ApplicationStatus; source?: string; sort?: string; order?: string }
  loadApplications: (seasonId: string) => Promise<void>
  setFilters: (filters: ApplicationState['filters']) => void
  addApplication: (app: Application) => void
  updateApplication: (app: Application) => void
  removeApplication: (id: string) => void
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  loading: false,
  filters: {},
  loadApplications: async (seasonId) => {
    set({ loading: true })
    const apps = await getApplications(seasonId, get().filters)
    set({ applications: apps, loading: false })
  },
  setFilters: (filters) => set({ filters }),
  addApplication: (app) => set(s => ({ applications: [app, ...s.applications] })),
  updateApplication: (app) => set(s => ({
    applications: s.applications.map(a => a.id === app.id ? app : a)
  })),
  removeApplication: (id) => set(s => ({
    applications: s.applications.filter(a => a.id !== id)
  })),
}))
