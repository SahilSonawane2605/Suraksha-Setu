import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Waves, Mountain, Wind, Sprout, Activity } from 'lucide-react'
import { riskColors, timeAgo } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'
import type { HazardType } from '@/types'

const hazardIcons: Record<HazardType, typeof Waves> = {
  Flood: Waves,
  Cyclone: Wind,
  Landslide: Mountain,
  Drought: Sprout,
  Earthquake: Activity,
  Erosion: AlertTriangle,
}

const severityColor: Record<string, string> = {
  critical: riskColors.critical,
  high: riskColors.high,
  moderate: riskColors.moderate,
  low: riskColors.low,
}

export default function AlertsPanel() {
  const navigate = useNavigate()
  const { villages, filteredAlerts: alerts, selectVillage } = useMapContext()
  const recent = alerts.slice(0, 7)

  const handleClick = (villageId: string) => {
    const v = villages.find((v) => v.id === villageId)
    if (v) selectVillage(v)
    navigate('/risk-map')
  }

  return (
    <div className="panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary">Recent Alerts</h3>
        <button onClick={() => navigate('/alerts')} className="text-xs text-risk-safe hover:underline">
          View all
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
        {recent.map((alert) => {
          const Icon = hazardIcons[alert.threatType] || AlertTriangle
          const color = severityColor[alert.severity] || riskColors.moderate
          return (
            <button
              key={alert.id}
              onClick={() => handleClick(alert.villageId)}
              className="w-full flex items-start gap-3 p-2.5 rounded-md border border-border bg-white/[0.02] hover:bg-white/[0.05] text-left transition-colors cursor-pointer"
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}1a`, border: `1px solid ${color}40` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-primary truncate">{alert.villageName}</p>
                  <span className="text-[11px] font-semibold tabular-nums shrink-0" style={{ color }}>
                    {alert.riskScore}
                  </span>
                </div>
                <p className="text-[11px] text-muted truncate">{alert.threatType} &middot; {alert.district}</p>
                <p className="text-[10px] text-muted mt-0.5">{timeAgo(alert.timestamp)}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
