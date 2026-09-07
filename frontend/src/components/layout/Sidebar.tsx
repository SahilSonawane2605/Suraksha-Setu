import { NavLink } from 'react-router-dom'
import {
  Shield,
  LayoutGrid,
  MapPinned,
  Home,
  Route,
  BellRing,
  FileBarChart,
  Settings as SettingsIcon,
  X,
} from 'lucide-react'
import { riskColors, riskLabels } from '@/utils/risk'
import type { RiskLevel } from '@/types'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/risk-map', label: 'Risk Map', icon: MapPinned },
  { to: '/habitations', label: 'Habitations', icon: Home },
  { to: '/relocation', label: 'Relocation Analysis', icon: Route },
  { to: '/alerts', label: 'Alerts & Notifications', icon: BellRing },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

const riskOrder: RiskLevel[] = ['critical', 'high', 'moderate', 'low', 'safe']

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 shrink-0 bg-sidebar border-r border-border
        flex flex-col transition-transform duration-200 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="SURAKSHA-SETU Logo"
              className="w-10 h-10 rounded-lg object-cover border border-emerald-500/30 shadow-md shrink-0 bg-slate-950"
            />
            <div className="leading-tight min-w-0">
              <p className="text-sm font-bold tracking-tight text-primary truncate">SURAKSHA-SETU</p>
              <p className="text-[10px] font-semibold text-emerald-400 truncate">Safer Communities &middot; Resilient Tomorrows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-muted hover:text-primary hover:bg-white/5 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors
                ${isActive
                  ? 'bg-risk-safe/10 text-risk-safe border border-risk-safe/25'
                  : 'text-muted hover:text-primary hover:bg-white/[0.04] border border-transparent'}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-border space-y-3">
          <p className="text-[11px] font-medium text-muted px-1">Risk Level Legend</p>
          <div className="grid grid-cols-1 gap-1.5">
            {riskOrder.map((level) => (
              <div key={level} className="flex items-center gap-2 px-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: riskColors[level] }}
                />
                <span className="text-xs text-muted">{riskLabels[level]}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-md bg-white/[0.03] border border-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-safe opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-safe" />
            </span>
            <span className="text-xs text-muted">All Systems Operational</span>
          </div>
        </div>
      </aside>
    </>
  )
}
