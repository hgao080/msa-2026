import { describe, expect, it } from 'vitest'
import { pipelineLevel, sourceLabel } from './status'
import type { ApplicationStage } from '@/types'

function stage(type: ApplicationStage['type']): ApplicationStage {
  return { id: '1', applicationId: '1', type, status: 'Completed' }
}

describe('pipelineLevel', () => {
  it('returns 1 for no stages', () => {
    expect(pipelineLevel({ stages: [] })).toBe(1)
  })

  it('returns 2 for OA or PhoneScreen', () => {
    expect(pipelineLevel({ stages: [stage('OA')] })).toBe(2)
    expect(pipelineLevel({ stages: [stage('PhoneScreen')] })).toBe(2)
  })

  it('returns 3 for Technical', () => {
    expect(pipelineLevel({ stages: [stage('Technical')] })).toBe(3)
  })

  it('returns 4 for Behavioural', () => {
    expect(pipelineLevel({ stages: [stage('Behavioural')] })).toBe(4)
  })

  it('picks the furthest stage type reached, not the last added', () => {
    expect(pipelineLevel({ stages: [stage('Behavioural'), stage('OA')] })).toBe(4)
  })

  it('returns 5 when offered, regardless of stages', () => {
    expect(pipelineLevel({ stages: [], offeredAt: '2026-01-01' })).toBe(5)
    expect(pipelineLevel({ stages: [stage('OA')], offeredAt: '2026-01-01' })).toBe(5)
  })
})

describe('sourceLabel', () => {
  it('maps known sources to display labels', () => {
    expect(sourceLabel('CompanyWebsite')).toBe('Company site')
    expect(sourceLabel('LinkedIn')).toBe('LinkedIn')
  })

  it('falls back to the raw string for unknown sources', () => {
    expect(sourceLabel('SomethingNew')).toBe('SomethingNew')
  })
})
