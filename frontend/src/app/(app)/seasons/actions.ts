'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSeason, closeSeason } from '@/lib/seasons'
import type { ActionState } from '@/app/(auth)/actions'

export async function closeSeasonAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await closeSeason(id, String(formData.get('outcome') ?? '') || undefined)
  } catch {
    return { error: 'Failed to close season' }
  }
  revalidatePath('/seasons')
  redirect('/seasons')
}

export async function createSeasonAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get('name'))
  const goal = String(formData.get('goal') ?? '')
  const weeklyTarget = parseInt(String(formData.get('weeklyTarget')), 10)

  try {
    await createSeason({ name, goal: goal || undefined, weeklyTarget })
  } catch {
    return { error: 'Failed to create season' }
  }

  redirect('/dashboard')
}
