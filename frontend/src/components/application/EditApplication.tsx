'use client'

import { useActionState, useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import type { Application } from '@/types'
import { updateApplicationAction, type FormState } from '@/app/(app)/applications/[id]/actions'
import { Modal } from '@/components/ui/Modal'
import { SOURCES, sourceLabel } from '@/lib/status'
import type { ApplicationPatch } from './ApplicationDetail'

const field =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent'

export function EditApplication({
  app,
  onOptimistic,
}: {
  app: Application
  onOptimistic: (patch: ApplicationPatch) => void
}) {
  const [open, setOpen] = useState(false)
  const action = updateApplicationAction.bind(null, app.id)
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  useEffect(() => {
    if (state.ok) setOpen(false)
  }, [state.ok])

  function clientAction(formData: FormData) {
    onOptimistic({
      company: String(formData.get('company') ?? '').trim(),
      role: String(formData.get('role') ?? '').trim(),
      source: String(formData.get('source') ?? app.source) as Application['source'],
      jobPostingUrl: String(formData.get('jobPostingUrl') ?? '') || undefined,
      notes: String(formData.get('notes') ?? '') || undefined,
    })
    return formAction(formData)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-fg-2 hover:text-fg"
      >
        <Pencil size={14} /> Edit
      </button>

      {open && (
        <Modal title="Edit application" onClose={() => setOpen(false)}>
          <form action={clientAction} className="space-y-3">
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
        </Modal>
      )}
    </>
  )
}
