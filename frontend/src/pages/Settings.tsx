import { useState } from 'react'
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${checked ? 'bg-risk-safe' : 'bg-white/10'}`}
      style={{ height: 22, width: 40 }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform"
        style={{ height: 18, width: 18, transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

export default function Settings() {
  const { layers, toggleLayer } = useMapContext()
  const [notifyCritical, setNotifyCritical] = useState(true)
  const [notifyHigh, setNotifyHigh] = useState(true)
  const [notifyDigest, setNotifyDigest] = useState(false)

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-primary">Settings</h1>
        <p className="text-sm text-muted mt-0.5">App theme, profile and layer preferences</p>
      </div>

      <div className="panel p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted">Name</label>
            <input
              defaultValue="Admin User"
              className="mt-1 w-full bg-white/[0.03] border border-border rounded-md py-2 px-3 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-risk-safe/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Role</label>
            <input
              defaultValue="District Authority"
              className="mt-1 w-full bg-white/[0.03] border border-border rounded-md py-2 px-3 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-risk-safe/50"
            />
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary">Command Center Dark Mode</p>
            <p className="text-xs text-muted mt-0.5">Optimized for 24/7 monitoring rooms</p>
          </div>
          <Toggle checked onChange={() => {}} />
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Default Map Layers</h3>
        <div className="space-y-3">
          {layerConfig.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-muted" />
                <span className="text-sm text-primary">{label}</span>
              </div>
              <Toggle checked={layers[key]} onChange={() => toggleLayer(key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Notification Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary">Critical risk alerts</span>
            <Toggle checked={notifyCritical} onChange={() => setNotifyCritical((v) => !v)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary">High risk alerts</span>
            <Toggle checked={notifyHigh} onChange={() => setNotifyHigh((v) => !v)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary">Daily digest email</span>
            <Toggle checked={notifyDigest} onChange={() => setNotifyDigest((v) => !v)} />
          </div>
        </div>
      </div>
    </div>
  )
}
