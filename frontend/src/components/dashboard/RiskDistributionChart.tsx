import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getRiskDistribution, formatNumber } from '@/utils/risk'
import { useMapContext } from '@/context/MapContext'

export default function RiskDistributionChart() {
  const { filteredVillages } = useMapContext()
  const data = getRiskDistribution(filteredVillages)
  const total = filteredVillages.length

  return (
    <div className="panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-primary">Risk Distribution</h3>
        <span className="text-xs text-muted">({total} filtered)</span>
      </div>
      <div className="relative flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="#0b1625"
              strokeWidth={2}
            >
              {data.map((slice) => (
                <Cell key={slice.level} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} habitations`, name]}
              contentStyle={{
                backgroundColor: '#0b1625',
                border: '1px solid #1c2b3d',
                borderRadius: 8,
                fontSize: 12,
                color: '#e5e7eb',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-primary tabular-nums">{formatNumber(total)}</span>
          <span className="text-[11px] text-muted">Total</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
        {data.map((slice) => (
          <div key={slice.level} className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
            <span className="text-[11px] text-muted truncate">{slice.label} ({slice.value})</span>
            <span className="text-[11px] text-primary ml-auto tabular-nums">{slice.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
