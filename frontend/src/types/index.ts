export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low' | 'safe'

export type HazardType = 'Flood' | 'Landslide' | 'Cyclone' | 'Drought' | 'Earthquake' | 'Erosion'

export interface Village {
  id: string
  name: string
  district: string
  block: string
  state: string
  lat: number
  lng: number
  population: number
  households: number
  riskScore: number // 0-100
  riskLevel: RiskLevel
  hazards: HazardType[]
  lastAssessed: string // ISO date
  vulnerableGroups: {
    children: number
    elderly: number
    disabled: number
  }
}

export type AlertSeverity = 'critical' | 'high' | 'moderate' | 'low'

export interface AlertItem {
  id: string
  villageId: string
  villageName: string
  district: string
  threatType: HazardType
  severity: AlertSeverity
  riskScore: number
  message: string
  timestamp: string // ISO datetime
  acknowledged: boolean
}

export interface RelocationSite {
  id: string
  name: string
  district: string
  lat: number
  lng: number
  capacity: number
  currentOccupancy: number
  facilities: string[]
  suitabilityScore: number // 0-100
  distanceFromRiskZoneKm: number
  status: 'ready' | 'under-construction' | 'planned'
}

export interface MapLayers {
  habitations: boolean
  riskZones: boolean
  floodZones: boolean
  landslideZones: boolean
  rivers: boolean
  roads: boolean
  relocationSites: boolean
}

export interface RiskDistributionSlice {
  level: RiskLevel
  label: string
  value: number
  percent: number
  color: string
}
