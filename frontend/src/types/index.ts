export interface User {
  id: string
  email: string
  username: string
  role: 'User' | 'Admin'
}

export interface Season {
  id: string
  name: string
  goal?: string
  weeklyTarget: number
  status: 'Active' | 'Archived'
  startDate: string
  endDate?: string
  outcome?: string
  finalApplicationCount?: number
  finalResponseRate?: number
  finalInterviewCount?: number
  finalOfferCount?: number
  finalStreakDays?: number
}

export interface Application {
  id: string
  seasonId: string
  company: string
  role: string
  jobPostingUrl?: string
  source: 'LinkedIn' | 'Seek' | 'Referral' | 'CompanyWebsite' | 'Other'
  status: ApplicationStatus
  appliedDate: string
  lastUpdated: string
  referrerName?: string
  notes?: string
  offeredAt?: string
  withdrawnAt?: string
  stages: ApplicationStage[]
}

export type ApplicationStatus =
  | 'Applied'
  | 'OA'
  | 'PhoneScreen'
  | 'Technical'
  | 'Behavioural'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'

export interface ApplicationStage {
  id: string
  applicationId: string
  type: 'OA' | 'PhoneScreen' | 'Technical' | 'Behavioural'
  status: 'Upcoming' | 'Completed' | 'Failed'
  scheduledDate?: string
  completedDate?: string
  notes?: string
}

export interface Milestone {
  id: string
  slug: string
  name: string
  description: string
}

export interface MilestoneStatus {
  milestone: Milestone
  unlockedAt: string | null
}

export interface Insight {
  type: string
  message: string
  priority: number
}

export interface FunnelStage {
  stage: string
  count: number
  conversionRate: number | null
}

export interface DashboardData {
  season: Season
  stats: {
    totalApplications: number
    responseRate: number
    totalInterviews: number
    currentStreak: number
    longestStreak: number
    weeklyProgress: number
    weeklyTarget: number
    personalBests: {
      bestWeekApplications: number
      longestStreak: number
    }
  }
  funnel: FunnelStage[]
  topInsight: Insight | null
  heatmap: Array<{ date: string; active: boolean }>
  milestones: MilestoneStatus[]
}
