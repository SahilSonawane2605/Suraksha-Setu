import { Home, ShieldAlert, Waves, Mountain, Droplets, RouteIcon, Tent } from 'lucide-react'
import { useMapContext } from '@/context/MapContext'
import type { MapLayers } from '@/types'

const layerConfig: { key: keyof MapLayers; label: string; icon: typeof Home }[] = [
  { key: 'habitations', label: 'Habitations', icon: Home },
  { key: 'riskZones', label: 'Risk Zones', icon: ShieldAlert },
  { key: 'floodZones', label: 'Flood Zones', icon: Waves },
  { key: 'landslideZones', label: 'Landslide Zones', icon: Mountain },
  { key: 'rivers', label: 'Rivers', icon: Droplets },
  { key: 'roads', label: 'Roads', icon: RouteIcon },
  { key: 'relocationSites', label: 'Relocation Sites', icon: Tent },
]

export default function LayerControl() {
  const { layers, toggleLayer } = useMapContext()

  return (
    <div className="panel p-3 w-52">
      <p className="text-[11px] font-medium text-muted px-1 mb-2">Map Layers</p>
      <div className="space-y-0.5">
        {layerConfig.map(({ key, label, icon: Icon }) => {
          const active = layers[key]
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs transition-colors
                ${active ? 'text-primary bg-white/[0.05]' : 'text-muted hover:bg-white/[0.03]'}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              <span
                className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center
                  ${active ? 'bg-risk-safe border-risk-safe' : 'border-border'}`}
              >
                {active && <span className="w-1.5 h-1.5 bg-bg rounded-[1px]" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
