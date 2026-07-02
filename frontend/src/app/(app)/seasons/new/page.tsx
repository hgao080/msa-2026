'use client'

import { useActionState } from 'react'
import { createSeasonAction } from '../actions'
import type { ActionState } from '@/app/(auth)/actions'

const field =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent'

export default function NewSeasonPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createSeasonAction, {})

  return (
    <main className="animate-launch mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 font-display text-2xl font-bold tracking-tight text-fg">New season</h1>
      <p className="mb-6 text-sm text-fg-2">Frame your hunt as a campaign. Keep the momentum.</p>
      <form action={action} className="space-y-4 rounded-xl border border-line bg-surface p-6">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fg-2">Season name</span>
          <input type="text" name="name" required placeholder="e.g. Summer '26 Internships" className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fg-2">Goal (optional)</span>
          <input type="text" name="goal" placeholder="e.g. Land a software engineering internship" className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-fg-2">Weekly application target</span>
          <input type="number" name="weeklyTarget" defaultValue={5} min={1} max={50} className={field} />
        </label>
        {state.error && <p className="text-sm text-lose">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Start season'}
        </button>
      </form>
    </main>
  )
}
