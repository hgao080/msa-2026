'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register, type ActionState } from '../actions'

const field =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent'

export default function RegisterPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(register, {})

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="animate-launch w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-block font-display text-3xl font-bold tracking-tight text-accent" style={{ transform: 'skewX(-8deg)' }}>
            HORME
          </span>
          <p className="mt-2 text-sm text-fg-2">Start your first season and build momentum.</p>
        </div>
        <form action={action} className="space-y-4 rounded-xl border border-line bg-surface p-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-2">Email</span>
            <input type="email" name="email" required className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-2">Username</span>
            <input type="text" name="username" required className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg-2">Password</span>
            <input type="password" name="password" required minLength={8} className={field} />
          </label>
          {state.error && <p className="text-sm text-lose">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? 'Creating account…' : 'Create account'}
          </button>
          <p className="text-center text-sm text-fg-2">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
