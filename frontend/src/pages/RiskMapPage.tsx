import RiskMap from '@/components/map/RiskMap'
import MapFilterBar from '@/components/map/MapFilterBar'
import { useMapContext } from '@/context/MapContext'
import { riskColors, riskLabels, formatNumber } from '@/utils/risk'
import { CheckCircle, ShieldAlert, Loader2, Navigation } from 'lucide-react'

export default function RiskMapPage() {
  const { villages, selectedVillageId, selectedAssessment, loadingAssessment } = useMapContext()
  const selected = villages.find((v) => v.id === selectedVillageId)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-primary">Risk Map & Decision Intelligence</h1>
        <p className="text-sm text-muted mt-0.5">Full-screen GIS view of habitations, hazard zones, carrying capacity & relocation assessment</p>
      </div>

      <MapFilterBar />

      <RiskMap height="calc(100vh - 280px)" />

      {selected && (
        <div className="panel p-4 space-y-3 border-l-4" style={{ borderLeftColor: riskColors[selected.riskLevel] || '#3b82f6' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
            <div>
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Active Habitation Selected</span>
              <h3 className="text-base font-bold text-primary">{selected.name}, {selected.district}</h3>
            </div>
            {loadingAssessment ? (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Loader2 className="w-4 h-4 animate-spin text-risk-safe" />
                Running Backend Risk & Relocation Engines...
              </div>
            ) : selectedAssessment ? (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase ${
                  selectedAssessment.status === 'SUITABLE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {selectedAssessment.status === 'SUITABLE' ? <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> : <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />}
                  Capacity Status: {selectedAssessment.status}
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-muted">Calculated Risk Score</p>
              <p className="text-sm font-extrabold" style={{ color: riskColors[selected.riskLevel] }}>
                {selected.riskScore} &middot; {riskLabels[selected.riskLevel]}
              </p>
            </div>
            <div>
              <p className="text-muted">Affected Population</p>
              <p className="text-sm font-semibold text-primary">{formatNumber(selected.population)} persons</p>
            </div>
            <div>
              <p className="text-muted">Active Threat Hazards</p>
              <p className="text-sm font-semibold text-primary">{selected.hazards.join(', ')}</p>
            </div>
            <div>
              <p className="text-muted">Priority Classification</p>
              <p className="text-sm font-semibold text-primary">{selectedAssessment?.priority || 'Priority Assessment'}</p>
            </div>
          </div>

          {selectedAssessment && selectedAssessment.final_recommendation && (
            <div className="rounded-lg border border-border bg-white/[0.02] p-3 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-accent-blue">
                <Navigation className="w-4 h-4 text-accent-blue" />
                <span>Backend Relocation Decision Recommendation:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-medium">
                {selectedAssessment.final_recommendation.summary}
              </p>
              {selectedAssessment.final_recommendation.target_shelter_name && (
                <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-muted">
                  <span>Target Site: <strong className="text-primary">{selectedAssessment.final_recommendation.target_shelter_name}</strong></span>
                  <span>Remaining Headroom: <strong className="text-emerald-400">{selectedAssessment.final_recommendation.remaining_headroom} beds available</strong></span>
                  <span>Transit Distance: <strong className="text-primary">{selectedAssessment.final_recommendation.transit_distance_km} km</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
