import client from './client'
import type { Application, ApplicationStage, ApplicationStatus } from '../types'

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
) =>
  client
    .get<Application[]>(`/api/seasons/${seasonId}/applications`, { params })
    .then(r => r.data)

export const getApplication = (id: string) =>
  client.get<Application>(`/api/applications/${id}`).then(r => r.data)

export const createApplication = (seasonId: string, data: CreateApplicationData) =>
  client.post<Application>(`/api/seasons/${seasonId}/applications`, data).then(r => r.data)

export const updateApplication = (
  id: string,
  data: { company?: string; role?: string; jobPostingUrl?: string; source?: string; notes?: string }
) =>
  client.put<Application>(`/api/applications/${id}`, data).then(r => r.data)

export const deleteApplication = (id: string) =>
  client.delete(`/api/applications/${id}`)

export const patchStatus = (id: string, status: ApplicationStatus) =>
  client.patch<Application>(`/api/applications/${id}/status`, { status }).then(r => r.data)

export const addStage = (id: string, data: { type: string; scheduledDate?: string }) =>
  client.post<ApplicationStage>(`/api/applications/${id}/stages`, data).then(r => r.data)

export const updateStage = (
  id: string,
  stageId: string,
  data: { status?: string; completedDate?: string; notes?: string }
) =>
  client.put<ApplicationStage>(`/api/applications/${id}/stages/${stageId}`, data).then(r => r.data)
