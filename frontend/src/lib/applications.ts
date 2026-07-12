import { apiFetch } from './api'
import type { Application, ApplicationStage } from '@/types'

export interface CreateApplicationData {
  company: string
  role: string
  jobPostingUrl?: string
  source: string
  appliedDate: string
  referrerName?: string
  notes?: string
}

export const getApplications = (seasonId: string) =>
  apiFetch<Application[]>(`/api/seasons/${seasonId}/applications`)

export const getApplication = (id: string) => apiFetch<Application>(`/api/applications/${id}`)

export const createApplication = (seasonId: string, data: CreateApplicationData) =>
  apiFetch<Application>(`/api/seasons/${seasonId}/applications`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateApplication = (
  id: string,
  data: { company?: string; role?: string; jobPostingUrl?: string; source?: string; notes?: string }
) => apiFetch<Application>(`/api/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteApplication = (id: string) =>
  apiFetch<void>(`/api/applications/${id}`, { method: 'DELETE' })

export const offerApplication = (id: string) =>
  apiFetch<Application>(`/api/applications/${id}/offer`, { method: 'POST' })

export const unofferApplication = (id: string) =>
  apiFetch<Application>(`/api/applications/${id}/offer`, { method: 'DELETE' })

export const withdrawApplication = (id: string) =>
  apiFetch<Application>(`/api/applications/${id}/withdraw`, { method: 'POST' })

export const unwithdrawApplication = (id: string) =>
  apiFetch<Application>(`/api/applications/${id}/withdraw`, { method: 'DELETE' })

export const addStage = (id: string, data: { type: string; scheduledDate?: string }) =>
  apiFetch<ApplicationStage>(`/api/applications/${id}/stages`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateStage = (
  id: string,
  stageId: string,
  data: { type?: string; status?: string; scheduledDate?: string; completedDate?: string; notes?: string }
) =>
  apiFetch<ApplicationStage>(`/api/applications/${id}/stages/${stageId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteStage = (id: string, stageId: string) =>
  apiFetch<void>(`/api/applications/${id}/stages/${stageId}`, { method: 'DELETE' })
