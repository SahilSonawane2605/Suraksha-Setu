import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown, PlusCircle } from 'lucide-react'
import { riskColors, riskLabels, formatNumber } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'
import type { RiskLevel } from '@/types'

const riskFilters: (RiskLevel | 'all')[] = ['all', 'critical', 'high', 'moderate', 'low', 'safe']

type SortKey = 'riskScore' | 'population' | 'name'

export default function Habitations() {
  const [sortKey, setSortKey] = useState<SortKey>('riskScore')
  const [sortDesc, setSortDesc] = useState(true)
  const navigate = useNavigate()
  const { villages, filteredVillages, filters, setFilter, searchQuery, setSearchQuery, selectVillage, setIsAddModalOpen } = useMapContext()

  const filtered = useMemo(() => {
    const list = [...filteredVillages]
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else cmp = a[sortKey] - b[sortKey]
      return sortDesc ? -cmp : cmp
    })
    return list
  }, [filteredVillages, sortKey, sortDesc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc((d) => !d)
    else {
      setSortKey(key)
      setSortDesc(true)
    }
  }

  const handleSelect = (id: string) => {
    const v = villages.find((v) => v.id === id)
    if (!v) return
    selectVillage(v)
    navigate('/risk-map')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-primary">Habitations</h1>
          <p className="text-sm text-muted mt-0.5">{filtered.length} of {villages.length} habitations shown</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Add Habitation
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, district or block..."
            className="w-full bg-card border border-border rounded-md py-2 pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-risk-safe/50"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {riskFilters.map((level) => (
            <button
              key={level}
              onClick={() => setFilter('riskLevel', level)}
              className={`px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap border transition-colors
                ${filters.riskLevel === level
                  ? 'bg-white/[0.06] border-white/20 text-primary'
                  : 'border-border text-muted hover:text-primary'}`}
            >
              {level === 'all' ? 'All' : riskLabels[level]}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] text-muted border-b border-border bg-white/[0.02]">
                <th className="font-medium px-4 py-3">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('name')}>
                    Habitation <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="font-medium px-4 py-3">District / Block</th>
                <th className="font-medium px-4 py-3">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('riskScore')}>
                    Risk Score <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="font-medium px-4 py-3">
                  <button className="flex items-center gap-1" onClick={() => toggleSort('population')}>
                    Population <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="font-medium px-4 py-3">Hazards</th>
                <th className="font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((v) => (
                <tr
                  key={v.id}
                  onClick={() => handleSelect(v.id)}
                  className="border-b border-border last:border-b-0 cursor-pointer hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 text-primary">{v.name}</td>
                  <td className="px-4 py-3 text-muted">{v.district}, {v.block}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums" style={{ color: riskColors[v.riskLevel] }}>
                    {v.riskScore}
                  </td>
                  <td className="px-4 py-3 text-muted tabular-nums">{formatNumber(v.population)}</td>
                  <td className="px-4 py-3 text-muted text-xs">{v.hazards.join(', ')}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ color: riskColors[v.riskLevel], backgroundColor: `${riskColors[v.riskLevel]}1a` }}
                    >
                      {riskLabels[v.riskLevel]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 60 && (
          <div className="px-4 py-3 text-xs text-muted border-t border-border">
            Showing first 60 of {filtered.length} results — refine your filters to narrow the list.
          </div>
        )}
      </div>
    </div>
  )
}
