'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/date'

export function LocalDate({ iso }: { iso?: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    setText(formatDate(iso))
  }, [iso])

  return <>{text}</>
}
