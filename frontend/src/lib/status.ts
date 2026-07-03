import type { Application, ApplicationStatus } from '@/types'

export const STATUSES: ApplicationStatus[] = [
  'Applied', 'OA', 'PhoneScreen', 'Technical', 'Behavioural', 'Offer', 'Rejected', 'Withdrawn',
]

export const SOURCES = ['LinkedIn', 'Seek', 'Referral', 'CompanyWebsite', 'Other'] as const

// each status → its CSS var on the violet momentum ramp (see globals.css)
export const STATUS_COLOR: Record<ApplicationStatus, string> = {
  Applied: 'var(--st-applied)',
  OA: 'var(--st-oa)',
  PhoneScreen: 'var(--st-phonescreen)',
  Technical: 'var(--st-technical)',
  Behavioural: 'var(--st-behavioural)',
  Offer: 'var(--st-offer)',
  Rejected: 'var(--st-rejected)',
  Withdrawn: 'var(--st-withdrawn)',
}

// position on the 5-node pipeline (Applied → Responded → Interview → Late round → Offer),
// based on the furthest stage type reached — not the most recently added stage
export function pipelineLevel(app: Pick<Application, 'stages' | 'offeredAt'>): number {
  if (app.offeredAt) return 5
  const types = new Set(app.stages.map((s) => s.type))
  if (types.has('Behavioural')) return 4
  if (types.has('Technical')) return 3
  if (types.has('OA') || types.has('PhoneScreen')) return 2
  return 1
}

const SOURCE_LABEL: Record<string, string> = {
  LinkedIn: 'LinkedIn',
  Seek: 'Seek',
  Referral: 'Referral',
  CompanyWebsite: 'Company site',
  Other: 'Other',
}

export const sourceLabel = (s: string) => SOURCE_LABEL[s] ?? s
