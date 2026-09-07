import { AlertOctagon, ShieldAlert, TriangleAlert, Home, Tent, PlusCircle } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import RiskMap from '@/components/map/RiskMap'
import MapFilterBar from '@/components/map/MapFilterBar'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import PriorityTable from '@/components/dashboard/PriorityTable'
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart'
import RelocationOverviewCard from '@/components/dashboard/RelocationOverviewCard'
import { riskColors } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'

export default function Dashboard() {
  const { filteredVillages, filteredShelters, setIsAddModalOpen } = useMapContext()

  // Recalculate exact statistics dynamically from the currently filtered dataset
  const counts = {
    critical: filteredVillages.filter((v) => v.riskLevel === 'critical').length,
    high: filteredVillages.filter((v) => v.riskLevel === 'high').length,
    moderate: filteredVillages.filter((v) => v.riskLevel === 'moderate').length,
    total: filteredVillages.length,
    sites: filteredShelters.length,
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.jpg"
            alt="SURAKSHA-SETU Logo"
            className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shadow-lg shrink-0 bg-slate-950"
          />
          <div>
            <h1 className="text-lg font-extrabold text-primary tracking-tight">SURAKSHA-SETU Command Center</h1>
            <p className="text-xs text-muted mt-0.5 font-medium">
              <span className="text-emerald-400 font-bold">SAFER COMMUNITIES &middot; STRONGER TOMORROWS</span> &mdash; Real-time disaster risk intelligence & relocation decision system
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add Habitation
        </button>
      </div>

      {/* Synchronized Multi-Attribute Map & Dashboard Filter Bar */}
      <MapFilterBar />

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4">
        <StatCard label="Critical Habitations" value={String(counts.critical)} icon={AlertOctagon} accentColor={riskColors.critical} />
        <StatCard label="High Risk Habitations" value={String(counts.high)} icon={TriangleAlert} accentColor={riskColors.high} />
        <StatCard label="Moderate Risk" value={String(counts.moderate)} icon={ShieldAlert} accentColor={riskColors.moderate} />
        <StatCard label="Total Habitations" value={String(counts.total)} icon={Home} accentColor={riskColors.low} />
        <StatCard label="Relocation Sites" value={String(counts.sites)} icon={Tent} accentColor="#3b82f6" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2">
          <RiskMap height="480px" />
        </div>
        <div className="h-[480px]">
          <AlertsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2">
          <PriorityTable />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
          <RiskDistributionChart />
          <RelocationOverviewCard />
        </div>
      </div>
    </div>
  )
}
