import { MapPin, Users, Gauge, CheckCircle, Navigation, ShieldAlert } from 'lucide-react'
import { formatNumber } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'

const statusStyles: Record<string, string> = {
  ready: 'text-risk-safe bg-risk-safe/10 border-risk-safe/30',
  'under-construction': 'text-risk-moderate bg-risk-moderate/10 border-risk-moderate/30',
  planned: 'text-muted bg-white/5 border-border',
}

const statusLabels: Record<string, string> = {
  ready: 'Ready',
  'under-construction': 'Under Construction',
  planned: 'Planned',
}

export default function RelocationAnalysis() {
  const { shelters, selectedVillage, selectedAssessment } = useMapContext()

  const sorted = [...shelters].sort((a, b) => b.suitabilityScore - a.suitabilityScore)
  const totalCapacity = shelters.reduce((s, r) => s + r.capacity, 0)
  const totalOccupancy = shelters.reduce((s, r) => s + r.currentOccupancy, 0)
  const avgSuitability = shelters.length > 0
    ? Math.round(shelters.reduce((s, r) => s + r.suitabilityScore, 0) / shelters.length)
    : 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-primary">Relocation & Carrying Capacity Analysis</h1>
        <p className="text-sm text-muted mt-0.5">Site suitability and carrying-capacity headroom across {shelters.length} active relocation centers</p>
      </div>

      {selectedVillage && selectedAssessment && (
        <div className="panel p-4 space-y-3 border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Live Backend Relocation Recommendation</span>
              <h2 className="text-base font-bold text-primary">{selectedVillage.name} ({selectedVillage.district})</h2>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase ${
              selectedAssessment.status === 'SUITABLE'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {selectedAssessment.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg border border-border bg-white/[0.02]">
              <span className="text-muted block">Evacuation Urgency</span>
              <span className="font-bold text-red-400">{selectedAssessment.final_recommendation?.evacuation_urgency || 'Normal'}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-white/[0.02]">
              <span className="text-muted block">Recommended Target Site</span>
              <span className="font-bold text-primary">{selectedAssessment.final_recommendation?.target_shelter_name || 'N/A'}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-white/[0.02]">
              <span className="text-muted block">Remaining Headroom</span>
              <span className="font-bold text-emerald-400">{selectedAssessment.final_recommendation?.remaining_headroom ?? 'N/A'} vacant slots</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedAssessment.final_recommendation?.summary}
          </p>

          {selectedAssessment.alternative_shelters && selectedAssessment.alternative_shelters.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">Evaluated Relocation Candidates (Ranked)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedAssessment.alternative_shelters.map((cand) => (
                  <div key={cand.shelter_id} className="p-2.5 rounded-md border border-border bg-white/[0.03] text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-primary">
                      <span>#{cand.rank} {cand.shelter_name}</span>
                      <span className="text-emerald-400 text-[11px]">{cand.suitability_score}% Suitability</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>Distance: {cand.distance_km} km</span>
                      <span>Headroom: {cand.remaining_headroom} slots</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="panel p-4">
          <p className="text-xs text-muted">Total Capacity</p>
          <p className="text-xl font-bold text-primary mt-1 tabular-nums">{formatNumber(totalCapacity)}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-muted">Current Occupancy</p>
          <p className="text-xl font-bold text-primary mt-1 tabular-nums">{formatNumber(totalOccupancy)}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs text-muted">Average Suitability</p>
          <p className="text-xl font-bold text-primary mt-1 tabular-nums">{avgSuitability}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((site) => {
          const occupancyPct = site.capacity > 0 ? Math.round((site.currentOccupancy / site.capacity) * 100) : 0
          return (
            <div key={site.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{site.name}</p>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" /> {site.district} &middot; {site.distanceFromRiskZoneKm} km from risk zone
                  </p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${statusStyles[site.status] || statusStyles.ready}`}>
                  {statusLabels[site.status] || 'Ready'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-muted" />
                  <div>
                    <p className="text-xs text-primary tabular-nums">{formatNumber(site.currentOccupancy)} / {formatNumber(site.capacity)}</p>
                    <p className="text-[10px] text-muted">Occupancy ({occupancyPct}%)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-muted" />
                  <div>
                    <p className="text-xs text-primary tabular-nums">{site.suitabilityScore}%</p>
                    <p className="text-[10px] text-muted">Suitability Score</p>
                  </div>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-accent-blue"
                  style={{ width: `${Math.min(100, occupancyPct)}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {site.facilities.map((f) => (
                  <span key={f} className="text-[10px] text-muted px-2 py-1 rounded-full bg-white/[0.04] border border-border">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
