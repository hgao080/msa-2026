'use client'

import { useActionState, useEffect, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import type { Application } from '@/types'
import { updateApplicationAction, type FormState } from '@/app/(app)/applications/[id]/actions'
import { SOURCES, sourceLabel } from '@/lib/status'

const field =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent'

export function EditApplication({ app }: { app: Application }) {
  const [open, setOpen] = useState(false)
  const action = updateApplicationAction.bind(null, app.id)
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  useEffect(() => {
    if (state.ok) setOpen(false)
  }, [state.ok])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-fg-2 hover:text-fg"
      >
        <Pencil size={14} /> Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-fg">Edit application</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-fg-3 hover:text-fg">
                <X size={18} />
              </button>
            </div>
            <form action={formAction} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs text-fg-2">Company *</span>
                <input name="company" required defaultValue={app.company} className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-fg-2">Role *</span>
                <input name="role" required defaultValue={app.role} className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-fg-2">Source</span>
                <select name="source" defaultValue={app.source} className={field}>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{sourceLabel(s)}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-fg-2">Job posting URL</span>
                <input name="jobPostingUrl" type="url" defaultValue={app.jobPostingUrl ?? ''} className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-fg-2">Notes</span>
                <textarea name="notes" rows={3} defaultValue={app.notes ?? ''} className={field} />
              </label>
              {state.error && <p className="text-sm text-lose">{state.error}</p>}
              <button type="submit" disabled={pending} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {pending ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
