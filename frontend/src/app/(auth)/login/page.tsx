'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, type ActionState } from '../actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {})

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Roster</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">Track your job hunt like a season</p>
        <form action={action} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
          >
            {pending ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            No account?{' '}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
