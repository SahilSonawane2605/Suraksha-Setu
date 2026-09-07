"""Domain Entities and Internal Data Structures.
"""
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

@dataclass
class HabitationEntity:
    id: str
    name: str
    alias: Optional[str]
    district: str
    latitude: float
    longitude: float
    population: int
    elevation_meters: float = 1200.0
    slope_degrees: float = 25.0
    historical_hazards_count: int = 3
    rainfall_mm: float = 85.0
    soil_saturation_pct: float = 75.0
    risk_score: float = 0.0
    risk_level: str = "Safe"
    priority: str = "Normal"
    flood_risk: str = "Safe"
    landslide_risk: str = "Safe"

@dataclass
class RelocationSiteEntity:
    id: str
    name: str
    alias: Optional[str]
    latitude: float
    longitude: float
    total_capacity: int
    available_capacity: int
    elevation_meters: float = 1450.0
    suitability_score: float = 85.0
    road_access_quality: str = "Paved All-Weather"
    is_active: bool = True

@dataclass
class HazardZoneEntity:
    id: str
    name: str
    hazard_type: str  # Flood or Landslide
    risk_level: str
    geojson_geometry: Dict[str, Any]
    details: Dict[str, Any] = field(default_factory=dict)
