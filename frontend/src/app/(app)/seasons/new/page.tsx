'use client'

import { useActionState } from 'react'
import { createSeasonAction } from '../actions'
import type { ActionState } from '@/app/(auth)/actions'

export default function NewSeasonPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(createSeasonAction, {})

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Season</h1>
      <form action={action} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Season name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Winter 2025 Grad Hunt"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal (optional)</label>
          <input
            type="text"
            name="goal"
            placeholder="e.g. Land a software engineering role"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weekly application target
          </label>
          <input
            type="number"
            name="weeklyTarget"
            defaultValue={5}
            min={1}
            max={50}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
        >
          {pending ? 'Creating...' : 'Start season'}
        </button>
      </form>
    </main>
  )
}
