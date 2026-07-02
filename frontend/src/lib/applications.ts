import { apiFetch, query } from './api'
import type { Application, ApplicationStage, ApplicationStatus } from '@/types'

export interface CreateApplicationData {
  company: string
  role: string
  jobPostingUrl?: string
  source: string
  appliedDate: string
  referrerName?: string
  notes?: string
}

export const getApplications = (
  seasonId: string,
  params?: { status?: ApplicationStatus; source?: string; sort?: string; order?: string }
) => apiFetch<Application[]>(`/api/seasons/${seasonId}/applications${query(params)}`)

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

export const patchStatus = (id: string, status: ApplicationStatus) =>
  apiFetch<Application>(`/api/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const addStage = (id: string, data: { type: string; scheduledDate?: string }) =>
  apiFetch<ApplicationStage>(`/api/applications/${id}/stages`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateStage = (
  id: string,
  stageId: string,
  data: { status?: string; completedDate?: string; notes?: string }
) =>
  apiFetch<ApplicationStage>(`/api/applications/${id}/stages/${stageId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
