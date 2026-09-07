import type { RiskLevel, RiskDistributionSlice, Village } from '@/types'
import { villages as defaultVillages } from '@/data/villages'

export const riskColors: Record<RiskLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  low: '#84cc16',
  safe: '#14b8a6',
}

export const riskLabels: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  safe: 'Safe',
}

export const riskLevelFromScore = (score: number): RiskLevel => {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'moderate'
  if (score >= 20) return 'low'
  return 'safe'
}

export function getRiskDistribution(villageList: Village[] = defaultVillages): RiskDistributionSlice[] {
  const order: RiskLevel[] = ['critical', 'high', 'moderate', 'low', 'safe']
  const total = villageList.length || 1
  const counts = order.map((level) => villageList.filter((v) => v.riskLevel === level).length)
  return order.map((level, i) => ({
    level,
    label: riskLabels[level],
    value: counts[i],
    percent: Math.round((counts[i] / total) * 1000) / 10,
    color: riskColors[level],
  }))
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
