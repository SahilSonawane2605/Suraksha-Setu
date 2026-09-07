import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, Menu, CircleUserRound } from 'lucide-react'
import { useMapContext } from '@/context/MapContext'
import { riskColors } from '@/utils/risk'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { villages, alerts, searchQuery, setSearchQuery, selectVillage } = useMapContext()
  const [focused, setFocused] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const blurTimeout = useRef<number | null>(null)

  const results = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return villages
      .filter((v) => v.name.toLowerCase().includes(q) || v.district.toLowerCase().includes(q))
      .slice(0, 8)
  }, [villages, searchQuery])

  const handleSelect = (villageId: string) => {
    const village = villages.find((v) => v.id === villageId)
    if (!village) return
    selectVillage(village)
    setSearchQuery('')
    setFocused(false)
    navigate('/risk-map')
  }

  const unackedCount = alerts.filter((a) => !a.acknowledged).length

  return (
    <header className="sticky top-0 z-20 h-16 shrink-0 bg-bg/90 backdrop-blur border-b border-border flex items-center gap-3 px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-muted hover:text-primary hover:bg-white/5 cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            blurTimeout.current = window.setTimeout(() => setFocused(false), 120)
          }}
          type="text"
          placeholder="Search villages, districts, locations..."
          className="w-full bg-card border border-border rounded-md py-2 pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-risk-safe/50 focus:border-risk-safe/50"
        />
        {focused && results.length > 0 && (
          <div className="absolute mt-1.5 w-full panel overflow-hidden z-30">
            {results.map((v) => (
              <button
                key={v.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(v.id)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04] border-b border-border last:border-b-0 cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-sm text-primary truncate">{v.name}</p>
                  <p className="text-xs text-muted truncate">{v.district} District &middot; {v.block}</p>
                </div>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ color: riskColors[v.riskLevel], backgroundColor: `${riskColors[v.riskLevel]}1a` }}
                >
                  {v.riskScore}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2.5 rounded-md text-muted hover:text-primary hover:bg-white/5 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unackedCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-risk-critical text-[10px] leading-4 text-center font-semibold text-white">
              {unackedCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            onBlur={() => window.setTimeout(() => setUserMenuOpen(false), 120)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-white/5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center">
              <CircleUserRound className="w-4 h-4 text-accent-blue" />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-medium text-primary">Admin User</p>
              <p className="text-[11px] text-muted">District Authority</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted hidden sm:block" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-52 panel overflow-hidden z-30">
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left px-3 py-2.5 text-sm text-muted hover:text-primary hover:bg-white/[0.04] cursor-pointer"
              >
                Profile & Settings
              </button>
              <button className="w-full text-left px-3 py-2.5 text-sm text-muted hover:text-primary hover:bg-white/[0.04] border-t border-border cursor-pointer">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
