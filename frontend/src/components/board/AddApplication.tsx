'use client'

import { useActionState, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus } from 'lucide-react'
import { createApplicationAction, type FormState } from '@/app/(app)/board/actions'
import { Modal } from '@/components/ui/Modal'
import { SOURCES, sourceLabel } from '@/lib/status'

const field =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent'

export function AddApplication({ seasonId }: { seasonId: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const action = createApplicationAction.bind(null, seasonId)
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  useEffect(() => {
    if (state.ok) setOpen(false)
  }, [state.ok])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white max-[640px]:hidden"
        style={{ boxShadow: '0 6px 18px -6px var(--accent)' }}
      >
        <Plus size={15} /> Log application
      </button>

      {mounted &&
        createPortal(
          <button
            onClick={() => setOpen(true)}
            aria-label="Log application"
            className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-30 hidden h-11 w-11 items-center justify-center rounded-full bg-accent text-white max-[640px]:flex"
            style={{ boxShadow: '0 10px 24px -6px var(--accent)' }}
          >
            <Plus size={18} />
          </button>,
          document.body
        )}

      {open && (
        <Modal title="Log application" onClose={() => setOpen(false)}>
          <form action={formAction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 block">
                  <span className="mb-1 block text-xs text-fg-2">Company *</span>
                  <input name="company" required className={field} placeholder="e.g. Canva" />
                </label>
                <label className="col-span-2 block">
                  <span className="mb-1 block text-xs text-fg-2">Role *</span>
                  <input name="role" required className={field} placeholder="e.g. Frontend Engineer Intern" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-fg-2">Source</span>
                  <select name="source" className={field} defaultValue="LinkedIn">
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{sourceLabel(s)}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-fg-2">Applied date</span>
                  <input
                    type="date"
                    name="appliedDate"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className={field}
                  />
                </label>
                <label className="col-span-2 block">
                  <span className="mb-1 block text-xs text-fg-2">Job posting URL</span>
                  <input name="jobPostingUrl" type="url" className={field} placeholder="https://…" />
                </label>
                <label className="col-span-2 block">
                  <span className="mb-1 block text-xs text-fg-2">Notes</span>
                  <textarea name="notes" rows={2} className={field} />
                </label>
              </div>
              {state.error && <p className="text-sm text-lose">{state.error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pending ? 'Adding…' : 'Add to board'}
              </button>
          </form>
        </Modal>
      )}
    </>
  )
}
