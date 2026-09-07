import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle, useMap } from 'react-leaflet'
import { floodZones, landslideZones, rivers, roads } from '@/data/geo'
import { riskColors, riskLabels, formatNumber } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'
import { villageDivIcon, relocationDivIcon } from './VillageMarker'

const DEFAULT_CENTER: [number, number] = [17.922, 73.615] // Mahad, Maharashtra

function FlyToController() {
  const map = useMap()
  const { flyTo } = useMapContext()

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 11, { duration: 1.1 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTo?.key])

  return null
}

interface RiskMapProps {
  height?: string
}

export default function RiskMap({ height = '520px' }: RiskMapProps) {
  const { filteredVillages, filteredShelters, layers, selectedVillageId, selectedVillage, selectVillage } = useMapContext()

  const mapCenter: [number, number] = filteredVillages.length > 0
    ? [filteredVillages[0].lat, filteredVillages[0].lng]
    : DEFAULT_CENTER

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={8}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />
        <FlyToController />

        {layers.riskZones && layers.habitations && filteredVillages.map((v) => (
          <Polygon
            key={`zone-${v.id}`}
            positions={[
              [v.lat + 0.045, v.lng],
              [v.lat, v.lng + 0.045],
              [v.lat - 0.045, v.lng],
              [v.lat, v.lng - 0.045],
            ]}
            pathOptions={{
              color: riskColors[v.riskLevel] || '#eab308',
              weight: 1,
              fillOpacity: v.riskLevel === 'critical' || v.riskLevel === 'high' ? 0.12 : 0.05,
              opacity: 0.4,
            }}
          />
        ))}

        {layers.floodZones && floodZones.map((z) => (
          <Polygon
            key={z.id}
            positions={z.coords}
            pathOptions={{ color: '#3b82f6', weight: 1.5, fillOpacity: 0.15, opacity: 0.6 }}
          >
            <Popup>{z.name}</Popup>
          </Polygon>
        ))}

        {layers.landslideZones && landslideZones.map((z) => (
          <Polygon
            key={z.id}
            positions={z.coords}
            pathOptions={{ color: '#a855f7', weight: 1.5, fillOpacity: 0.15, opacity: 0.6 }}
          >
            <Popup>{z.name}</Popup>
          </Polygon>
        ))}

        {layers.rivers && rivers.map((r) => (
          <Polyline
            key={r.id}
            positions={r.path}
            pathOptions={{ color: '#38bdf8', weight: 2, opacity: 0.55 }}
          >
            <Popup>{r.name}</Popup>
          </Polyline>
        ))}

        {layers.roads && roads.map((r) => (
          <Polyline
            key={r.id}
            positions={r.path}
            pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '4 4', opacity: 0.6 }}
          >
            <Popup>{r.name}</Popup>
          </Polyline>
        ))}

        {layers.habitations && filteredVillages.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={villageDivIcon(v.riskLevel, v.id === selectedVillageId)}
            eventHandlers={{ click: () => selectVillage(v) }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-sm">{v.name}</p>
                <p className="text-xs text-slate-400 mb-2">{v.block}, {v.district}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Score</span>
                    <span className="font-semibold" style={{ color: riskColors[v.riskLevel] }}>
                      {v.riskScore} &middot; {riskLabels[v.riskLevel]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Population</span>
                    <span>{formatNumber(v.population)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hazards</span>
                    <span>{v.hazards.join(', ')}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.relocationSites && filteredShelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={relocationDivIcon()}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-slate-400 mb-2">{s.district}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity</span>
                    <span>{formatNumber(s.capacity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupancy</span>
                    <span>{formatNumber(s.currentOccupancy)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Suitability</span>
                    <span>{s.suitabilityScore}%</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Alert Danger Visualization (Revealed when an alert / village is selected even if Map Layers are OFF) */}
        {selectedVillage && (
          <>
            <Circle
              center={[selectedVillage.lat, selectedVillage.lng]}
              radius={3500}
              pathOptions={{
                color: selectedVillage.hazards.includes('Landslide') ? '#a855f7' : '#3b82f6',
                fillColor: selectedVillage.hazards.includes('Landslide') ? '#a855f7' : '#3b82f6',
                fillOpacity: 0.25,
                weight: 2.5,
                dashArray: '6, 6',
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-bold text-xs uppercase tracking-wider text-amber-400">ACTIVE ALERT THREAT ZONE</p>
                  <p className="font-semibold text-sm text-white">{selectedVillage.name}</p>
                  <p className="text-xs text-slate-300">Hazard: {selectedVillage.hazards.join(', ')}</p>
                  <p className="text-xs text-slate-300">Risk Score: {selectedVillage.riskScore}</p>
                </div>
              </Popup>
            </Circle>

            <Polygon
              positions={[
                [selectedVillage.lat + 0.045, selectedVillage.lng],
                [selectedVillage.lat, selectedVillage.lng + 0.045],
                [selectedVillage.lat - 0.045, selectedVillage.lng],
                [selectedVillage.lat, selectedVillage.lng - 0.045],
              ]}
              pathOptions={{
                color: riskColors[selectedVillage.riskLevel] || '#ef4444',
                weight: 2,
                fillOpacity: 0.2,
                opacity: 0.8,
              }}
            />

            {!layers.habitations && (
              <Marker
                position={[selectedVillage.lat, selectedVillage.lng]}
                icon={villageDivIcon(selectedVillage.riskLevel, true)}
                eventHandlers={{ click: () => selectVillage(selectedVillage) }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-sm">{selectedVillage.name}</p>
                    <p className="text-xs text-slate-400 mb-2">{selectedVillage.block}, {selectedVillage.district}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Score</span>
                        <span className="font-semibold" style={{ color: riskColors[selectedVillage.riskLevel] }}>
                          {selectedVillage.riskScore} &middot; {riskLabels[selectedVillage.riskLevel]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Population</span>
                        <span>{formatNumber(selectedVillage.population)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hazards</span>
                        <span>{selectedVillage.hazards.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  )
}
