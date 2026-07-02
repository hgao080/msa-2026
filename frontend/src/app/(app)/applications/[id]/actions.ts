'use server'

import { revalidatePath } from 'next/cache'
import { patchStatus, updateApplication, addStage, updateStage } from '@/lib/applications'
import type { ApplicationStatus } from '@/types'

export interface FormState {
  error?: string
  ok?: boolean
}

export async function patchStatusAction(id: string, status: ApplicationStatus) {
  await patchStatus(id, status)
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
