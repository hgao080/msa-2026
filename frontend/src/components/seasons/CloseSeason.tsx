'use client'

import { useActionState, useState } from 'react'
import { closeSeasonAction } from '@/app/(app)/seasons/actions'
import { Modal } from '@/components/ui/Modal'
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
        <Modal title="Close this season" onClose={() => setOpen(false)}>
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
        </Modal>
      )}
    </>
  )
}
