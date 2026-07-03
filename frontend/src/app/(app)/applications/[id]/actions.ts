'use server'

import { revalidatePath } from 'next/cache'
import {
  updateApplication,
  addStage,
  updateStage,
  deleteStage,
  offerApplication,
  unofferApplication,
  withdrawApplication,
  unwithdrawApplication,
} from '@/lib/applications'

export interface FormState {
  error?: string
  ok?: boolean
}

export async function offerAction(id: string) {
  await offerApplication(id)
  revalidatePath(`/applications/${id}`)
  revalidatePath('/board')
}

export async function unofferAction(id: string) {
  await unofferApplication(id)
  revalidatePath(`/applications/${id}`)
  revalidatePath('/board')
}

export async function withdrawAction(id: string) {
  await withdrawApplication(id)
  revalidatePath(`/applications/${id}`)
  revalidatePath('/board')
}

export async function unwithdrawAction(id: string) {
  await unwithdrawApplication(id)
  revalidatePath(`/applications/${id}`)
  revalidatePath('/board')
}

export async function updateApplicationAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const company = String(formData.get('company') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  if (!company || !role) return { error: 'Company and role are required.' }

  try {
    await updateApplication(id, {
      company,
      role,
      source: String(formData.get('source') ?? 'Other'),
      jobPostingUrl: String(formData.get('jobPostingUrl') ?? '') || undefined,
      notes: String(formData.get('notes') ?? '') || undefined,
    })
  } catch {
    return { error: 'Failed to save changes.' }
  }

  revalidatePath(`/applications/${id}`)
  revalidatePath('/board')
  return { ok: true }
}

export async function addStageAction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const type = String(formData.get('type') ?? '')
  if (!type) return { error: 'Pick a stage type.' }

  try {
    await addStage(id, {
      type,
      scheduledDate: String(formData.get('scheduledDate') ?? '') || undefined,
    })
  } catch {
    return { error: 'Failed to add stage.' }
  }

  revalidatePath(`/applications/${id}`)
  return { ok: true }
}

export async function updateStageStatusAction(
  appId: string,
  stageId: string,
  status: 'Upcoming' | 'Completed' | 'Failed'
) {
  await updateStage(appId, stageId, {
    status,
    completedDate: status === 'Completed' ? new Date().toISOString() : undefined,
  })
  revalidatePath(`/applications/${appId}`)
}

export async function editStageAction(
  appId: string,
  stageId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const type = String(formData.get('type') ?? '')
  if (!type) return { error: 'Pick a stage type.' }

  try {
    await updateStage(appId, stageId, {
      type,
      scheduledDate: String(formData.get('scheduledDate') ?? '') || undefined,
      notes: String(formData.get('notes') ?? '') || undefined,
    })
  } catch {
    return { error: 'Failed to update stage.' }
  }

  revalidatePath(`/applications/${appId}`)
  return { ok: true }
}

export async function deleteStageAction(appId: string, stageId: string) {
  await deleteStage(appId, stageId)
  revalidatePath(`/applications/${appId}`)
  revalidatePath('/board')
}
