import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  accentColor: string
  sublabel?: string
}

export default function StatCard({ label, value, icon: Icon, accentColor, sublabel }: StatCardProps) {
  return (
    <div className="panel p-4 flex items-start justify-between gap-3 min-w-0">
      <div className="min-w-0">
        <p className="text-xs text-muted truncate">{label}</p>
        <p className="text-2xl font-bold text-primary mt-1.5 tabular-nums">{value}</p>
        {sublabel && <p className="text-[11px] text-muted mt-1">{sublabel}</p>}
      </div>
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accentColor}1a`, border: `1px solid ${accentColor}40` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: accentColor, width: 18, height: 18 }} />
      </div>
    </div>
  )
}
