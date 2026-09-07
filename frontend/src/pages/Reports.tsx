import { useState } from 'react'
import { FileText, Download, Check } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMapContext } from '@/context/MapContext'
import MapFilterBar from '@/components/map/MapFilterBar'
import { districtSummary } from '@/utils/reports'

const reportTemplates = [
  { id: 'RPT-1', name: 'District Risk Summary', description: 'Habitation counts and average risk score by district' },
  { id: 'RPT-2', name: 'Relocation Readiness Report', description: 'Capacity, occupancy and suitability across all sites' },
  { id: 'RPT-3', name: 'Alert Log Export', description: 'Full alert history with severity and acknowledgement status' },
  { id: 'RPT-4', name: 'Vulnerable Population Assessment', description: 'Children, elderly and disabled population by risk tier' },
]

export default function Reports() {
  const { filteredVillages, filteredShelters, filteredAlerts } = useMapContext()
  const [generated, setGenerated] = useState<Set<string>>(new Set())

  // Dynamic calculation strictly from live backend / context data
  const data = districtSummary(filteredVillages)

  const downloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleGenerate = (id: string) => {
    setGenerated((prev) => new Set(prev).add(id))
    const timestamp = new Date().toISOString().split('T')[0]

    if (id === 'RPT-1') {
      let csv = 'District,Habitation Count,Average Risk Score\n'
      data.forEach((row) => {
        csv += `"${row.district}",${row.habitations},${row.avgRisk}\n`
      })
      csv += '\nHabitation ID,Name,District,Block,Risk Score,Risk Level,Population,Latitude,Longitude\n'
      filteredVillages.forEach((v) => {
        csv += `"${v.id}","${v.name}","${v.district}","${v.block}",${v.riskScore},"${v.riskLevel}",${v.population},${v.lat},${v.lng}\n`
      })
      downloadCsv(`SURAKSHA-SETU_District_Risk_Summary_${timestamp}.csv`, csv)
    } else if (id === 'RPT-2') {
      let csv = 'Site ID,Site Name,District,Total Capacity,Current Occupancy,Suitability Score,Status\n'
      filteredShelters.forEach((s) => {
        csv += `"${s.id}","${s.name}","${s.district}",${s.capacity},${s.currentOccupancy},${s.suitabilityScore},"${s.status}"\n`
      })
      downloadCsv(`SURAKSHA-SETU_Relocation_Readiness_${timestamp}.csv`, csv)
    } else if (id === 'RPT-3') {
      let csv = 'Alert ID,Village ID,Village Name,District,Threat Type,Severity,Risk Score,Message,Timestamp,Acknowledged\n'
      filteredAlerts.forEach((a) => {
        csv += `"${a.id}","${a.villageId}","${a.villageName}","${a.district}","${a.threatType}","${a.severity}",${a.riskScore},"${a.message.replace(/"/g, '""')}","${a.timestamp}",${a.acknowledged}\n`
      })
      downloadCsv(`SURAKSHA-SETU_Alert_Log_${timestamp}.csv`, csv)
    } else if (id === 'RPT-4') {
      let csv = 'Habitation ID,Name,District,Risk Level,Total Population,Children,Elderly,Disabled\n'
      filteredVillages.forEach((v) => {
        csv += `"${v.id}","${v.name}","${v.district}","${v.riskLevel}",${v.population},${v.vulnerableGroups.children},${v.vulnerableGroups.elderly},${v.vulnerableGroups.disabled}\n`
      })
      downloadCsv(`SURAKSHA-SETU_Vulnerable_Population_${timestamp}.csv`, csv)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-primary">Reports & Intelligence Exports</h1>
        <p className="text-sm text-muted mt-0.5">Real-time database analytics summaries and exportable reports</p>
      </div>

      {/* Synchronized Application Filter Center */}
      <MapFilterBar />

      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">Average Risk Score by District</h3>
          <span className="text-xs text-muted font-medium">{filteredVillages.length} Habitations Analyzed</span>
        </div>
        <div className="h-64">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2b3d" vertical={false} />
                <XAxis dataKey="district" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1c2b3d' }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1625', border: '1px solid #1c2b3d', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="avgRisk" fill="#f97316" radius={[4, 4, 0, 0]} name="Avg Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted">
              No habitations match the selected filter criteria.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reportTemplates.map((r) => {
          const isGenerated = generated.has(r.id)
          return (
            <div key={r.id} className="panel p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-border flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary">{r.name}</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{r.description}</p>
                <button
                  onClick={() => handleGenerate(r.id)}
                  className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors cursor-pointer
                    ${isGenerated
                      ? 'text-risk-safe border-risk-safe/30 bg-risk-safe/10'
                      : 'text-muted border-border hover:text-primary hover:bg-white/[0.04]'}`}
                >
                  {isGenerated ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  {isGenerated ? 'Report Downloaded' : 'Generate & Export Report'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
