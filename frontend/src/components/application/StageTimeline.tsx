'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { ApplicationStage } from '@/types'
import {
  addStageAction,
  updateStageStatusAction,
  editStageAction,
  deleteStageAction,
  type FormState,
} from '@/app/(app)/applications/[id]/actions'
import { formatDate } from '@/lib/date'

const STAGE_TYPES = ['OA', 'PhoneScreen', 'Technical', 'Behavioural']
const STAGE_STATUSES: ApplicationStage['status'][] = ['Upcoming', 'Completed', 'Failed']

function dotStyle(status: ApplicationStage['status']) {
  if (status === 'Completed') return { background: 'var(--win)', borderColor: 'var(--win)' }
  if (status === 'Failed') return { background: 'var(--lose)', borderColor: 'var(--lose)' }
  return { background: 'transparent', borderColor: 'var(--fg-3)' }
}

function StageStatusPicker({ appId, stage }: { appId: string; stage: ApplicationStage }) {
  const [pending, start] = useTransition()
  return (
    <div className="flex gap-1">
      {STAGE_STATUSES.map((s) => (
        <button
          key={s}
          disabled={pending || s === stage.status}
          onClick={() => start(() => void updateStageStatusAction(appId, stage.id, s))}
          className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide transition-colors ${
            s === stage.status ? 'bg-accent-soft text-accent' : 'text-fg-3 hover:text-fg'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

function StageEditForm({ appId, stage, onDone }: { appId: string; stage: ApplicationStage; onDone: () => void }) {
  const action = editStageAction.bind(null, appId, stage.id)
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  useEffect(() => {
    if (state.ok) onDone()
  }, [state.ok, onDone])

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-line bg-surface-2 p-4">
      <div className="flex flex-wrap gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-fg-2">Type</span>
          <select
            name="type"
            defaultValue={stage.type}
            required
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg"
          >
            {STAGE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-fg-2">Scheduled date</span>
          <input
            type="date"
            name="scheduledDate"
            defaultValue={stage.scheduledDate?.slice(0, 10)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs text-fg-2">Notes</span>
        <textarea
          name="notes"
          defaultValue={stage.notes ?? ''}
          rows={2}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg"
        />
      </label>
      {state.error && <p className="text-sm text-lose">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onDone} className="rounded-lg px-4 py-2 text-sm text-fg-2 hover:text-fg">
          Cancel
        </button>
      </div>
    </form>
  )
}

function StageRow({ appId, stage }: { appId: string; stage: ApplicationStage }) {
  const [editing, setEditing] = useState(false)
  const [deleting, startDelete] = useTransition()

  return (
    <li className="relative">
      <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2" style={dotStyle(stage.status)} />
      {editing ? (
        <StageEditForm appId={appId} stage={stage} onDone={() => setEditing(false)} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-sm font-semibold text-fg">{stage.type}</p>
              <p className="text-xs text-fg-3">
                {stage.status === 'Completed' && stage.completedDate
                  ? `Completed ${formatDate(stage.completedDate)}`
                  : stage.scheduledDate
                    ? `Scheduled ${formatDate(stage.scheduledDate)}`
                    : stage.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StageStatusPicker appId={appId} stage={stage} />
              <button onClick={() => setEditing(true)} aria-label="Edit stage" className="text-fg-3 hover:text-fg">
                <Pencil size={13} />
              </button>
              <button
                disabled={deleting}
                onClick={() => {
                  if (confirm('Delete this stage?')) startDelete(() => void deleteStageAction(appId, stage.id))
                }}
                aria-label="Delete stage"
                className="text-fg-3 hover:text-lose disabled:opacity-50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          {stage.notes && <p className="mt-1 text-xs text-fg-2">{stage.notes}</p>}
        </>
      )}
    </li>
  )
}

export function StageTimeline({ appId, stages }: { appId: string; stages: ApplicationStage[] }) {
  const [open, setOpen] = useState(false)
  const action = addStageAction.bind(null, appId)
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})

  useEffect(() => {
    if (state.ok) setOpen(false)
  }, [state.ok])

  return (
    <section>
      <h2 className="mb-4 font-display text-lg font-semibold text-fg">Stages</h2>

      {stages.length === 0 && !open && (
        <p className="mb-4 text-sm text-fg-2">No stages yet — add interviews and assessments as they come up.</p>
      )}

      <ol className="relative space-y-5 border-l border-line pl-6">
        {stages.map((stage) => (
          <StageRow key={stage.id} appId={appId} stage={stage} />
        ))}
      </ol>

      {open ? (
        <form action={formAction} className="mt-5 space-y-3 rounded-lg border border-line bg-surface-2 p-4">
          <div className="flex flex-wrap gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-fg-2">Type</span>
              <select name="type" required className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg">
                {STAGE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-fg-2">Scheduled date</span>
              <input type="date" name="scheduledDate" className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg" />
            </label>
          </div>
          {state.error && <p className="text-sm text-lose">{state.error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {pending ? 'Adding…' : 'Add stage'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-fg-2 hover:text-fg">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-fg-2 hover:text-fg"
        >
          <Plus size={14} /> Add stage
        </button>
      )}
    </section>
  )
}
