import { useNavigate } from 'react-router-dom'
import { riskColors, riskLabels, formatNumber } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'

export default function PriorityTable() {
  const navigate = useNavigate()
  const { filteredVillages, selectVillage } = useMapContext()

  const priorityVillages = [...filteredVillages]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 8)

  const handleRowClick = (id: string) => {
    const v = filteredVillages.find((v) => v.id === id)
    if (!v) return
    selectVillage(v)
    navigate('/risk-map')
  }

  return (
    <div className="panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-primary">Priority Habitations</h3>
          <span className="text-xs text-muted">({filteredVillages.length} matched)</span>
        </div>
        <button
          onClick={() => navigate('/habitations')}
          className="text-xs text-risk-safe hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>
      <div className="overflow-x-auto -mx-4 px-4 flex-1">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left text-[11px] text-muted border-b border-border">
              <th className="font-medium pb-2 pr-3">Habitation</th>
              <th className="font-medium pb-2 pr-3">Risk Score</th>
              <th className="font-medium pb-2 pr-3">Population</th>
              <th className="font-medium pb-2">Priority</th>
            </tr>
          </thead>
          <tbody>
            {priorityVillages.map((v) => (
              <tr
                key={v.id}
                onClick={() => handleRowClick(v.id)}
                className="border-b border-border last:border-b-0 cursor-pointer hover:bg-white/[0.03]"
              >
                <td className="py-2.5 pr-3">
                  <p className="text-primary truncate max-w-[140px]">{v.name}</p>
                  <p className="text-[11px] text-muted truncate max-w-[140px]">{v.district}</p>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="font-semibold tabular-nums" style={{ color: riskColors[v.riskLevel] }}>
                    {v.riskScore}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-muted tabular-nums">{formatNumber(v.population)}</td>
                <td className="py-2.5">
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ color: riskColors[v.riskLevel], backgroundColor: `${riskColors[v.riskLevel]}1a` }}
                  >
                    {riskLabels[v.riskLevel]}
                  </span>
                </td>
              </tr>
            ))}
            {priorityVillages.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-xs text-muted">
                  No habitations match the current filter selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
