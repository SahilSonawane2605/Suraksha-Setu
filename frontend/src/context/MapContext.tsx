import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { MapLayers, Village, RelocationSite, AlertItem, RiskLevel, HazardType } from '@/types'
import {
  fetchVillagesApi,
  fetchSheltersApi,
  fetchAlertsApi,
  fetchVillageAssessmentApi,
  createVillageApi,
  type VillageAssessmentResponse,
  type CreateVillagePayload,
} from '@/api/client'
import { villages as initialVillages } from '@/data/villages'
import { relocationSites as initialSites } from '@/data/relocationSites'
import { alerts as initialAlerts } from '@/data/alerts'

interface FlyToTarget {
  lat: number
  lng: number
  zoom?: number
  key: number
}

export interface FilterState {
  riskLevel: RiskLevel | 'all'
  district: string
  hazardType: HazardType | 'all'
}

const defaultFilters: FilterState = {
  riskLevel: 'all',
  district: 'all',
  hazardType: 'all',
}

interface MapContextValue {
  villages: Village[]
  shelters: RelocationSite[]
  alerts: AlertItem[]
  filteredVillages: Village[]
  filteredShelters: RelocationSite[]
  filteredAlerts: AlertItem[]
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
  availableDistricts: string[]
  selectedVillageId: string | null
  selectedVillage: Village | null
  selectedAssessment: VillageAssessmentResponse | null
  loadingAssessment: boolean
  selectVillage: (village: Village | null) => void
  flyTo: FlyToTarget | null
  layers: MapLayers
  toggleLayer: (layer: keyof MapLayers) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  addNewVillage: (payload: CreateVillagePayload) => Promise<Village>
  refreshData: () => Promise<void>
}

const defaultLayers: MapLayers = {
  habitations: true,
  riskZones: true,
  floodZones: false,
  landslideZones: false,
  rivers: true,
  roads: false,
  relocationSites: true,
}

const MapContext = createContext<MapContextValue | undefined>(undefined)

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [villages, setVillages] = useState<Village[]>(initialVillages)
  const [shelters, setShelters] = useState<RelocationSite[]>(initialSites)
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts)
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters)
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<VillageAssessmentResponse | null>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(false)
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null)
  const [layers, setLayers] = useState<MapLayers>(defaultLayers)
  const [searchQuery, setSearchQuery] = useState('')
  const [flyKey, setFlyKey] = useState(0)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const loadBackendData = useCallback(async () => {
    try {
      const [vData, sData, aData] = await Promise.all([
        fetchVillagesApi(),
        fetchSheltersApi(),
        fetchAlertsApi(),
      ])
      if (vData && vData.length > 0) setVillages(vData)
      if (sData && sData.length > 0) setShelters(sData)
      if (aData && aData.length > 0) setAlerts(aData)
    } catch (err) {
      console.warn('Backend data load warning, using initial fallback state:', err)
    }
  }, [])

  useEffect(() => {
    loadBackendData()
  }, [loadBackendData])

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    setSearchQuery('')
  }, [])

  const availableDistricts = useMemo(() => {
    const set = new Set<string>()
    villages.forEach((v) => {
      if (v.district) set.add(v.district)
    })
    return Array.from(set).sort()
  }, [villages])

  // Single Source of Truth Filtered Dataset (evaluated against Data Filters)
  const filteredVillages = useMemo(() => {
    return villages.filter((v) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch = !q ||
        v.name.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q) ||
        v.block.toLowerCase().includes(q)

      const matchesRisk = filters.riskLevel === 'all' || v.riskLevel === filters.riskLevel
      const matchesDistrict = filters.district === 'all' || v.district.toLowerCase() === filters.district.toLowerCase()
      const matchesHazard = filters.hazardType === 'all' || v.hazards.includes(filters.hazardType as HazardType)

      return matchesSearch && matchesRisk && matchesDistrict && matchesHazard
    })
  }, [villages, searchQuery, filters])

  const filteredShelters = useMemo(() => {
    if (!layers.relocationSites) return []

    return shelters.filter((s) => {
      const matchesDistrict = filters.district === 'all' || s.district.toLowerCase() === filters.district.toLowerCase() || s.district === 'State District'
      return matchesDistrict
    })
  }, [shelters, filters.district, layers.relocationSites])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesDistrict = filters.district === 'all' || a.district.toLowerCase() === filters.district.toLowerCase()
      const matchesHazard = filters.hazardType === 'all' || a.threatType === filters.hazardType

      return matchesDistrict && matchesHazard
    })
  }, [alerts, filters.district, filters.hazardType])

  const selectedVillage = useMemo(() => {
    return villages.find((v) => v.id === selectedVillageId) || null
  }, [villages, selectedVillageId])

  const selectVillage = useCallback(async (village: Village | null) => {
    setSelectedVillageId(village ? village.id : null)
    if (village) {
      setFlyKey((k) => k + 1)
      setFlyTo({ lat: village.lat, lng: village.lng, zoom: 11, key: flyKey + 1 })
      
      setLoadingAssessment(true)
      try {
        const assessment = await fetchVillageAssessmentApi(village.id)
        setSelectedAssessment(assessment)
      } catch (err) {
        console.warn('Could not fetch assessment from backend API:', err)
        setSelectedAssessment(null)
      } finally {
        setLoadingAssessment(false)
      }
    } else {
      setSelectedAssessment(null)
    }
  }, [flyKey])

  const toggleLayer = useCallback((layer: keyof MapLayers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  const addNewVillage = useCallback(async (payload: CreateVillagePayload): Promise<Village> => {
    const newV = await createVillageApi(payload)
    setVillages((prev) => [newV, ...prev])
    return newV
  }, [])

  const value = useMemo(
    () => ({
      villages,
      shelters,
      alerts,
      filteredVillages,
      filteredShelters,
      filteredAlerts,
      filters,
      setFilter,
      resetFilters,
      availableDistricts,
      selectedVillageId,
      selectedVillage,
      selectedAssessment,
      loadingAssessment,
      selectVillage,
      flyTo,
      layers,
      toggleLayer,
      searchQuery,
      setSearchQuery,
      isAddModalOpen,
      setIsAddModalOpen,
      addNewVillage,
      refreshData: loadBackendData,
    }),
    [
      villages,
      shelters,
      alerts,
      filteredVillages,
      filteredShelters,
      filteredAlerts,
      filters,
      setFilter,
      resetFilters,
      availableDistricts,
      selectedVillageId,
      selectedVillage,
      selectedAssessment,
      loadingAssessment,
      selectVillage,
      flyTo,
      layers,
      toggleLayer,
      searchQuery,
      isAddModalOpen,
      addNewVillage,
      loadBackendData,
    ]
  )

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export function useMapContext() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used within MapProvider')
  return ctx
}
