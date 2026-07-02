'use client'

import { useActionState, useState } from 'react'
import { X } from 'lucide-react'
import { closeSeasonAction } from '@/app/(app)/seasons/actions'
import type { ActionState } from '@/app/(auth)/actions'

export function CloseSeason({ seasonId }: { seasonId: string }) {
  const [open, setOpen] = useState(false)
  const action = closeSeasonAction.bind(null, seasonId)
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {})

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg-2 hover:text-fg"
      >
        Close season
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-fg">Close this season</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-fg-3 hover:text-fg">
                <X size={18} />
              </button>
            </div>
            <p className="mb-4 text-sm text-fg-2">
              Archives the season with its final stats. You can start a new one afterward.
            </p>
            <form action={formAction} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs text-fg-2">Outcome (optional)</span>
                <textarea
                  name="outcome"
                  rows={3}
                  placeholder="e.g. Signed with Canva as a frontend intern 🎉"
                  className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              {state.error && <p className="text-sm text-lose">{state.error}</p>}
              <button type="submit" disabled={pending} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {pending ? 'Closing…' : 'Close season'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
