import type { Village, RelocationSite, AlertItem, RiskLevel, HazardType } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export interface BackendVillage {
  id: string
  name: string
  alias?: string
  district: string
  latitude: number
  longitude: number
  population: number
  elevation_meters: number
  slope_degrees: number
  historical_hazards_count: number
  rainfall_mm: number
  soil_saturation_pct: number
  risk_score: number
  risk_level: string
  priority: string
  flood_risk: string
  landslide_risk: string
}

export interface BackendShelter {
  id: string
  name: string
  alias?: string
  latitude: number
  longitude: number
  total_capacity: number
  available_capacity: number
  elevation_meters: number
  suitability_score: number
  road_access_quality: string
  is_active: boolean
}

export interface BackendAlert {
  id: string
  village_id: string
  village_name: string
  district: string
  type: string
  message: string
  timestamp: string
  read: boolean
}

export interface FinalEvacuationRecommendation {
  target_shelter_id?: string
  target_shelter_name?: string
  target_shelter_capacity?: number
  remaining_headroom?: number
  evacuation_urgency: string
  recommended_action: string
  transit_distance_km?: number
  summary: string
}

export interface CandidateShelter {
  shelter_id: string
  shelter_name: string
  alias?: string
  distance_km: number
  elevation_meters: number
  total_capacity: number
  available_capacity: number
  remaining_headroom: number
  status: string
  is_suitable: boolean
  suitability_score: number
  rank: number
  route_status: string
}

export interface VillageAssessmentResponse {
  village_id: string
  village_name: string
  alias?: string
  district: string
  coordinates: {
    latitude: number
    longitude: number
  }
  population: number
  risk_score: number
  risk_percentage: string
  risk_level: string
  priority: string
  flood_risk: string
  landslide_risk: string
  vulnerability_breakdown: Record<string, number>
  hazard_zone_intersections: string[]
  recommended_site?: string
  recommended_site_id?: string
  site_capacity?: number
  remaining_headroom?: number
  status: string
  final_recommendation: FinalEvacuationRecommendation
  alternative_shelters: CandidateShelter[]
}

// Convert Backend Village to Frontend Village Interface
export function mapBackendVillageToFrontend(bv: BackendVillage): Village {
  const levelLower = (bv.risk_level || 'moderate').toLowerCase() as RiskLevel
  const hazardsList: HazardType[] = []

  if (bv.flood_risk && bv.flood_risk !== 'Safe' && bv.flood_risk !== 'Low') {
    hazardsList.push('Flood')
  }
  if (bv.landslide_risk && bv.landslide_risk !== 'Safe' && bv.landslide_risk !== 'Low') {
    hazardsList.push('Landslide')
  }
  if (hazardsList.length === 0) {
    hazardsList.push('Flood')
  }

  return {
    id: bv.id,
    name: bv.name,
    district: bv.district || 'State District',
    block: bv.alias || 'Central',
    state: 'State',
    lat: bv.latitude,
    lng: bv.longitude,
    population: bv.population,
    households: Math.round(bv.population / 4.5),
    riskScore: Math.round(bv.risk_score),
    riskLevel: levelLower,
    hazards: hazardsList,
    lastAssessed: new Date().toISOString().split('T')[0],
    vulnerableGroups: {
      children: Math.round(bv.population * 0.22),
      elderly: Math.round(bv.population * 0.12),
      disabled: Math.round(bv.population * 0.03),
    },
  }
}

// Convert Backend Shelter to Frontend RelocationSite
export function mapBackendShelterToFrontend(bs: BackendShelter): RelocationSite {
  return {
    id: bs.id,
    name: bs.name,
    district: 'State District',
    lat: bs.latitude,
    lng: bs.longitude,
    capacity: bs.total_capacity,
    currentOccupancy: bs.total_capacity - bs.available_capacity,
    facilities: [bs.road_access_quality || 'Paved Access', 'Water Supply', 'Medical Outpost'],
    suitabilityScore: Math.round(bs.suitability_score),
    distanceFromRiskZoneKm: 4.2,
    status: bs.available_capacity > 0 ? 'ready' : 'under-construction',
  }
}

// Convert Backend Alert to Frontend AlertItem
export function mapBackendAlertToFrontend(ba: BackendAlert): AlertItem {
  const typeUpper = (ba.type || 'MODERATE').toUpperCase()
  const severityLower = typeUpper === 'CRITICAL' ? 'critical' : typeUpper === 'HIGH' ? 'high' : 'moderate'
  const msgLower = (ba.message || '').toLowerCase()
  const threat: HazardType = msgLower.includes('landslide') || msgLower.includes('slope') ? 'Landslide' : 'Flood'

  return {
    id: ba.id,
    villageId: ba.village_id,
    villageName: ba.village_name,
    district: ba.district,
    threatType: threat,
    severity: severityLower,
    riskScore: severityLower === 'critical' ? 95 : severityLower === 'high' ? 80 : 65,
    message: ba.message,
    timestamp: ba.timestamp || new Date().toISOString(),
    acknowledged: ba.read || false,
  }
}

// API Requests
export async function fetchVillagesApi(): Promise<Village[]> {
  const res = await fetch(`${API_BASE_URL}/villages`)
  if (!res.ok) throw new Error(`Failed to fetch villages: ${res.statusText}`)
  const data: BackendVillage[] = await res.json()
  return data.map(mapBackendVillageToFrontend)
}

export async function fetchSheltersApi(): Promise<RelocationSite[]> {
  const res = await fetch(`${API_BASE_URL}/shelters`)
  if (!res.ok) throw new Error(`Failed to fetch shelters: ${res.statusText}`)
  const data: BackendShelter[] = await res.json()
  return data.map(mapBackendShelterToFrontend)
}

export async function fetchAlertsApi(): Promise<AlertItem[]> {
  const res = await fetch(`${API_BASE_URL}/alerts`)
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`)
  const data: BackendAlert[] = await res.json()
  return data.map(mapBackendAlertToFrontend)
}

export async function fetchVillageAssessmentApi(villageId: string): Promise<VillageAssessmentResponse> {
  const res = await fetch(`${API_BASE_URL}/villages/${encodeURIComponent(villageId)}/assessment`)
  if (!res.ok) throw new Error(`Failed to fetch village assessment: ${res.statusText}`)
  return await res.json()
}

export interface CreateVillagePayload {
  id: string
  name: string
  district: string
  latitude: number
  longitude: number
  population: number
  elevation_meters?: number
  slope_degrees?: number
  rainfall_mm?: number
  soil_saturation_pct?: number
  historical_hazards_count?: number
}

export async function createVillageApi(payload: CreateVillagePayload): Promise<Village> {
  const res = await fetch(`${API_BASE_URL}/villages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Failed to create village: ${errText}`)
  }
  const data: BackendVillage = await res.json()
  return mapBackendVillageToFrontend(data)
}
