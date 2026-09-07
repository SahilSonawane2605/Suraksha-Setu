import React, { useState } from 'react'
import { X, PlusCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useMapContext } from '@/context/MapContext'

export default function AddVillageModal() {
  const { isAddModalOpen, setIsAddModalOpen, addNewVillage, selectVillage } = useMapContext()

  const [id, setId] = useState(`VLG-${Math.floor(1000 + Math.random() * 9000)}`)
  const [name, setName] = useState('')
  const [district, setDistrict] = useState('')
  const [lat, setLat] = useState('18.5204')
  const [lng, setLng] = useState('73.8567')
  const [population, setPopulation] = useState('1850')
  const [elevation, setElevation] = useState('1250')
  const [slope, setSlope] = useState('28')
  const [rainfall, setRainfall] = useState('110')
  const [soilSaturation, setSoilSaturation] = useState('82')
  const [hazardsCount, setHazardsCount] = useState('3')

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isAddModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Habitation Name is required')
      return
    }
    if (!district.trim()) {
      setErrorMsg('District is required')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const payload = {
        id: id.trim() || `VLG-${Date.now()}`,
        name: name.trim(),
        district: district.trim(),
        latitude: parseFloat(lat) || 18.5204,
        longitude: parseFloat(lng) || 73.8567,
        population: parseInt(population, 10) || 1000,
        elevation_meters: parseFloat(elevation) || 1200,
        slope_degrees: parseFloat(slope) || 20,
        rainfall_mm: parseFloat(rainfall) || 90,
        soil_saturation_pct: parseFloat(soilSaturation) || 70,
        historical_hazards_count: parseInt(hazardsCount, 10) || 2,
      }

      const created = await addNewVillage(payload)
      setSuccessMsg(`Habitation '${created.name}' successfully registered and risk assessed!`)
      
      setTimeout(() => {
        selectVillage(created)
        setIsAddModalOpen(false)
        setSuccessMsg(null)
      }, 1200)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to register village with backend API.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl space-y-4 text-slate-100 my-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Add New Habitation</h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Habitation Code / ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
                placeholder="e.g. VLG-1082"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Habitation Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
                placeholder="e.g. Pune Valley Alpha"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">District *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
                placeholder="e.g. Pune / Satara / Raigad"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Population Count</label>
              <input
                type="number"
                min="1"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Latitude (°N)</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
                placeholder="e.g. 18.5204"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Longitude (°E)</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
                placeholder="e.g. 73.8567"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Elevation (meters)</label>
              <input
                type="number"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Slope Angle (°)</label>
              <input
                type="number"
                value={slope}
                onChange={(e) => setSlope(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">24h Rainfall (mm)</label>
              <input
                type="number"
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Soil Saturation (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={soilSaturation}
                onChange={(e) => setSoilSaturation(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Historical Hazards Recorded</label>
            <input
              type="number"
              min="0"
              value={hazardsCount}
              onChange={(e) => setHazardsCount(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 focus:border-emerald-500/70 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 px-5 py-2 font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Submit & Calculate Risk
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
