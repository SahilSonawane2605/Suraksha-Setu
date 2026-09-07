import { Users, Building2 } from 'lucide-react'
import { formatNumber } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'

export default function RelocationOverviewCard() {
  const { filteredVillages, filteredShelters } = useMapContext()

  const totalCapacity = filteredShelters.reduce((sum, s) => sum + s.capacity, 0)
  const affectedPopulation = filteredVillages
    .filter((v) => v.riskLevel === 'critical' || v.riskLevel === 'high')
    .reduce((sum, v) => sum + v.population, 0)
  const suitabilityPct = affectedPopulation > 0
    ? Math.min(100, Math.round((totalCapacity / affectedPopulation) * 100))
    : 100

  return (
    <div className="panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary">Relocation Overview</h3>
        <span className="text-xs text-muted">{filteredShelters.length} sites</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#1c2b3d" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(suitabilityPct / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-primary tabular-nums">{suitabilityPct}%</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">Relocation Suitability</p>
          <p className="text-[11px] text-muted mt-1 leading-relaxed">
            Capacity against critical/high-risk population in active filter selection.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-muted mb-1">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[11px]">Affected Population</span>
          </div>
          <p className="text-base font-semibold text-primary tabular-nums">{formatNumber(affectedPopulation)}</p>
        </div>
        <div className="rounded-md border border-border bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-muted mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Total Capacity</span>
          </div>
          <p className="text-base font-semibold text-primary tabular-nums">{formatNumber(totalCapacity)}</p>
        </div>
      </div>
    </div>
  )
}
