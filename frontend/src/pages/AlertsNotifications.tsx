import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Waves, Mountain, Wind, Sprout, Activity, AlertTriangle, Check } from 'lucide-react'
import { riskColors, timeAgo } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'
import type { AlertSeverity, HazardType } from '@/types'

const hazardIcons: Record<HazardType, typeof Waves> = {
  Flood: Waves,
  Cyclone: Wind,
  Landslide: Mountain,
  Drought: Sprout,
  Earthquake: Activity,
  Erosion: AlertTriangle,
}

const severityFilters: (AlertSeverity | 'all')[] = ['all', 'critical', 'high', 'moderate', 'low']

export default function AlertsNotifications() {
  const { alerts: liveAlerts, villages, selectVillage } = useMapContext()
  const [ackedIds, setAckedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all')
  const [showUnacked, setShowUnacked] = useState(false)
  const navigate = useNavigate()

  const alerts = useMemo(() => {
    return liveAlerts.map((a) => ({
      ...a,
      acknowledged: a.acknowledged || ackedIds.has(a.id),
    }))
  }, [liveAlerts, ackedIds])

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSeverity = filter === 'all' || a.severity === filter
      const matchesAck = !showUnacked || !a.acknowledged
      return matchesSeverity && matchesAck
    })
  }, [alerts, filter, showUnacked])

  const acknowledge = (id: string) => {
    setAckedIds((prev) => new Set([...prev, id]))
  }

  const goToVillage = (villageId: string) => {
    const v = villages.find((v) => v.id === villageId)
    if (v) selectVillage(v)
    navigate('/risk-map')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-primary">Alerts & Notifications</h1>
          <p className="text-sm text-muted mt-0.5">{alerts.filter((a) => !a.acknowledged).length} unacknowledged of {alerts.length} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {severityFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize cursor-pointer
                ${filter === s ? 'bg-white/[0.06] border-white/20 text-primary' : 'border-border text-muted hover:text-primary'}`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => setShowUnacked((v) => !v)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer
              ${showUnacked ? 'bg-risk-critical/10 border-risk-critical/30 text-risk-critical' : 'border-border text-muted hover:text-primary'}`}
          >
            Unacknowledged only
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((alert) => {
          const Icon = hazardIcons[alert.threatType] || AlertTriangle
          const color = riskColors[alert.severity === 'moderate' ? 'moderate' : alert.severity === 'low' ? 'low' : alert.severity] || riskColors.moderate
          return (
            <div key={alert.id} className="panel p-3.5 flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}1a`, border: `1px solid ${color}40` }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <button onClick={() => goToVillage(alert.villageId)} className="text-left cursor-pointer">
                    <p className="text-sm font-medium text-primary hover:underline">{alert.villageName}, {alert.district}</p>
                  </button>
                  <span className="text-[11px] text-muted whitespace-nowrap">{timeAgo(alert.timestamp)}</span>
                </div>
                <p className="text-xs text-muted mt-0.5">{alert.threatType}: {alert.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color, backgroundColor: `${color}1a` }}
                  >
                    Risk {alert.riskScore}
                  </span>
                  {alert.acknowledged ? (
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className="text-[11px] text-risk-safe hover:underline cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="panel p-8 text-center text-sm text-muted">No alerts match the current filters.</div>
        )}
      </div>
    </div>
  )
}
