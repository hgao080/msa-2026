import type { ApplicationStatus } from '@/types'

export const STATUSES: ApplicationStatus[] = [
  'Applied', 'OA', 'Screening', 'Technical', 'Final', 'Offer', 'Rejected', 'Withdrawn',
]

export const SOURCES = ['LinkedIn', 'Seek', 'Referral', 'CompanyWebsite', 'Other'] as const

// each status → its CSS var on the violet momentum ramp (see globals.css)
export const STATUS_COLOR: Record<ApplicationStatus, string> = {
  Applied: 'var(--st-applied)',
  OA: 'var(--st-oa)',
  Screening: 'var(--st-screening)',
  Technical: 'var(--st-technical)',
  Final: 'var(--st-final)',
  Offer: 'var(--st-offer)',
  Rejected: 'var(--st-rejected)',
  Withdrawn: 'var(--st-withdrawn)',
}

// position on the 5-node pipeline (Applied → Responded → Interview → Final → Offer)
export const STATUS_LEVEL: Record<ApplicationStatus, number> = {
  Applied: 1,
  OA: 2,
  Screening: 2,
  Technical: 3,
  Final: 4,
  Offer: 5,
  Rejected: 2,
  Withdrawn: 1,
}

const SOURCE_LABEL: Record<string, string> = {
  LinkedIn: 'LinkedIn',
  Seek: 'Seek',
  Referral: 'Referral',
  CompanyWebsite: 'Company site',
  Other: 'Other',
}

export const sourceLabel = (s: string) => SOURCE_LABEL[s] ?? s
