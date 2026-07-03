'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md rounded-xl border border-line bg-surface p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="text-fg-3 hover:text-fg">
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
