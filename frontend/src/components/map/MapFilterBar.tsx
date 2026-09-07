import { Filter, RotateCcw, ChevronDown, Layers, Home, ShieldAlert, Waves, Mountain, Droplets, RouteIcon, Tent } from 'lucide-react'
import { useMapContext } from '@/context/MapContext'
import type { RiskLevel, HazardType, MapLayers } from '@/types'

const layerConfig: { key: keyof MapLayers; label: string; icon: typeof Home }[] = [
  { key: 'habitations', label: 'Habitations', icon: Home },
  { key: 'riskZones', label: 'Risk Zones', icon: ShieldAlert },
  { key: 'floodZones', label: 'Flood Zones', icon: Waves },
  { key: 'landslideZones', label: 'Landslide Zones', icon: Mountain },
  { key: 'rivers', label: 'Rivers', icon: Droplets },
  { key: 'roads', label: 'Roads', icon: RouteIcon },
  { key: 'relocationSites', label: 'Relocation Sites', icon: Tent },
]

export default function MapFilterBar() {
  const {
    filters,
    setFilter,
    resetFilters,
    layers,
    toggleLayer,
    availableDistricts,
    filteredVillages,
    villages,
  } = useMapContext()

  const isFiltered = filters.district !== 'all' || filters.riskLevel !== 'all' || filters.hazardType !== 'all'
  const riskOptions: (RiskLevel | 'all')[] = ['all', 'critical', 'high', 'moderate', 'low', 'safe']
  const hazardOptions: (HazardType | 'all')[] = ['all', 'Flood', 'Landslide']

  return (
    <div className="panel p-4 shadow-lg space-y-4 border border-border bg-card/90 backdrop-blur-sm rounded-xl">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/80">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Filter className="w-4 h-4 text-risk-safe" />
          <span>Telemetry & Map Filter Center</span>
          {isFiltered && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-risk-safe/20 text-risk-safe border border-risk-safe/30">
              Active ({filteredVillages.length}/{villages.length} Habitations)
            </span>
          )}
        </div>
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-risk-critical hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* SECTION 1: DATA FILTERS */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted">
          <Filter className="w-3 h-3 text-sky-400" />
          <span>Data Filters (Synchronizes Map & Command Center Statistics)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* District Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">District Region</label>
            <div className="relative">
              <select
                value={filters.district}
                onChange={(e) => setFilter('district', e.target.value)}
                className="w-full bg-slate-900/80 border border-border rounded-md px-3 py-1.5 text-xs text-primary appearance-none focus:outline-none focus:border-risk-safe/60 cursor-pointer"
              >
                <option value="all">All Districts</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Risk Level Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Threat Risk Level</label>
            <div className="relative">
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilter('riskLevel', e.target.value as any)}
                className="w-full bg-slate-900/80 border border-border rounded-md px-3 py-1.5 text-xs text-primary appearance-none focus:outline-none focus:border-risk-safe/60 cursor-pointer"
              >
                {riskOptions.map((r) => (
                  <option key={r} value={r}>
                    {r === 'all' ? 'All Risk Levels' : `${r.charAt(0).toUpperCase() + r.slice(1)} Risk`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Hazard Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hazard Type</label>
            <div className="relative">
              <select
                value={filters.hazardType}
                onChange={(e) => setFilter('hazardType', e.target.value as any)}
                className="w-full bg-slate-900/80 border border-border rounded-md px-3 py-1.5 text-xs text-primary appearance-none focus:outline-none focus:border-risk-safe/60 cursor-pointer"
              >
                {hazardOptions.map((h) => (
                  <option key={h} value={h}>
                    {h === 'all' ? 'All Hazards' : `${h} Hazard`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MAP LAYER CONTROLS */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted">
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>Map Layer Controls (Map Visual Visibility Only)</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {layerConfig.map(({ key, label, icon: Icon }) => {
            const active = layers[key]
            return (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-white/[0.02] border-border text-muted hover:bg-white/[0.04] hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
                <span
                  className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center ${
                    active ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                  }`}
                >
                  {active && <span className="w-1.5 h-1.5 bg-slate-950 rounded-[1px]" />}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
