import L from 'leaflet'
import { riskColors } from '@/utils/risk'
import type { RiskLevel } from '@/types'

// Builds a colored SVG DivIcon per risk level to avoid Leaflet's default marker
// asset resolution issues when bundled with Vite.
const iconCache = new Map<string, L.DivIcon>()

export function villageDivIcon(riskLevel: RiskLevel, selected = false): L.DivIcon {
  const cacheKey = `${riskLevel}-${selected}`
  const cached = iconCache.get(cacheKey)
  if (cached) return cached

  const color = riskColors[riskLevel]
  const size = selected ? 26 : 18
  const ring = selected ? `<circle cx="13" cy="13" r="12" fill="none" stroke="${color}" stroke-width="2" opacity="0.5" />` : ''

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
      ${ring}
      <circle cx="13" cy="13" r="7" fill="${color}" stroke="#020b16" stroke-width="2" />
    </svg>
  `.trim()

  const icon = L.divIcon({
    html: svg,
    className: 'village-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
  iconCache.set(cacheKey, icon)
  return icon
}

export function relocationDivIcon(): L.DivIcon {
  const cacheKey = 'relocation'
  const cached = iconCache.get(cacheKey)
  if (cached) return cached

  const svg = `
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="18" height="18" rx="4" fill="#3b82f6" stroke="#020b16" stroke-width="2" />
      <path d="M11 6v10M6 11h10" stroke="#020b16" stroke-width="2" stroke-linecap="round" />
    </svg>
  `.trim()

  const icon = L.divIcon({
    html: svg,
    className: 'village-marker-icon',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
  iconCache.set(cacheKey, icon)
  return icon
}
