'use server'

import { revalidatePath } from 'next/cache'
import { createApplication } from '@/lib/applications'

export interface FormState {
  error?: string
  ok?: boolean
}

export async function createApplicationAction(
  seasonId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const company = String(formData.get('company') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()
  if (!company || !role) return { error: 'Company and role are required.' }

  try {
    await createApplication(seasonId, {
      company,
      role,
      source: String(formData.get('source') ?? 'Other'),
      appliedDate: String(formData.get('appliedDate') || new Date().toISOString().slice(0, 10)),
      jobPostingUrl: String(formData.get('jobPostingUrl') ?? '') || undefined,
      referrerName: String(formData.get('referrerName') ?? '') || undefined,
      notes: String(formData.get('notes') ?? '') || undefined,
    })
  } catch {
    return { error: 'Failed to add application.' }
  }

  revalidatePath('/board')
  return { ok: true }
}
