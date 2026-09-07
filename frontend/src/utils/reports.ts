import type { Village } from '@/types'

export function districtSummary(villages: Village[]) {
  const map = new Map<string, { total: number; sum: number }>()
  for (const v of villages) {
    const entry = map.get(v.district) ?? { total: 0, sum: 0 }
    entry.total += 1
    entry.sum += v.riskScore
    map.set(v.district, entry)
  }
  return Array.from(map.entries())
    .map(([district, { total, sum }]) => ({
      district,
      habitations: total,
      avgRisk: Math.round(sum / total),
    }))
    .sort((a, b) => b.avgRisk - a.avgRisk)
}
