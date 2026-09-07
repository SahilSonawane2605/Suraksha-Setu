"""Pydantic Request and Response Schemas.

Clean structured JSON models for FastAPI validation and React frontend consumption.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.core.constants import DATA_SOURCE_TAG, DATA_SOURCE_DISCLAIMER

# --- Geographic & Coordinate Models ---
class Coordinates(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")

# --- Habitation / Village Models ---
class VillageBase(BaseModel):
    id: str = Field(..., description="Unique village identifier, e.g. V01")
    name: str = Field(..., description="Habitation / Village name, e.g. Malana Heights")
    alias: Optional[str] = Field(None, description="Slug or common code, e.g. village-a")
    district: str = Field(..., description="Administrative district")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    population: int = Field(..., ge=0, description="Inhabitant population count")
    elevation_meters: float = Field(default=1200.0, description="Elevation above sea level in meters")
    slope_degrees: float = Field(default=25.0, ge=0.0, le=90.0, description="Terrain slope angle")
    historical_hazards_count: int = Field(default=3, ge=0, description="Past recorded hazard occurrences")
    rainfall_mm: float = Field(default=85.0, ge=0.0, description="Recent 24h rainfall intensity in mm")
    soil_saturation_pct: float = Field(default=75.0, ge=0.0, le=100.0, description="Soil saturation percentage")

class VillageCreate(VillageBase):
    pass

class VillageResponse(VillageBase):
    model_config = ConfigDict(from_attributes=True)

    risk_score: float = Field(..., description="Computed risk score 0 to 100")
    risk_level: str = Field(..., description="Critical, High, Moderate, Low, or Safe")
    priority: str = Field(..., description="Immediate Action, High Priority, etc.")
    flood_risk: str
    landslide_risk: str
    data_source: str = DATA_SOURCE_TAG

# --- Relocation Site / Shelter Models ---
class ShelterBase(BaseModel):
    id: str = Field(..., description="Unique shelter identifier, e.g. S01")
    name: str = Field(..., description="Shelter / Site name, e.g. Safe Site A - Shanti Camp")
    alias: Optional[str] = Field(None, description="Slug code, e.g. shelter-b")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    total_capacity: int = Field(..., gt=0, description="Total bed / person capacity")
    available_capacity: int = Field(..., ge=0, description="Current available vacant slots")
    elevation_meters: float = Field(default=1450.0, description="Shelter elevation in meters")
    suitability_score: float = Field(default=85.0, ge=0.0, le=100.0, description="Infrastructure & safety score")
    road_access_quality: str = Field(default="Paved All-Weather", description="Access route quality")
    is_active: bool = Field(default=True)

class ShelterCreate(ShelterBase):
    @field_validator("available_capacity")
    @classmethod
    def validate_capacity(cls, v, info):
        total = info.data.get("total_capacity")
        if total is not None and v > total:
            raise ValueError("available_capacity cannot exceed total_capacity")
        return v

class ShelterResponse(ShelterBase):
    model_config = ConfigDict(from_attributes=True)

    data_source: str = DATA_SOURCE_TAG

# --- Carrying Capacity Verification Models ---
class CapacityCheckRequest(BaseModel):
    affected_population: int = Field(..., ge=0, description="Number of evacuees to accommodate")
    site_capacity: int = Field(..., gt=0, description="Shelter capacity to check against")
    shelter_id: Optional[str] = None
    shelter_name: Optional[str] = None

class CapacityCheckResponse(BaseModel):
    affected_population: int
    site_capacity: int
    remaining_headroom: int = Field(..., description="Headroom = Site Capacity - Affected Population")
    occupancy_rate_pct: float
    status: str = Field(..., description="Suitable or Overcapacity")
    is_suitable: bool
    data_source: str = DATA_SOURCE_TAG

# --- Candidate Shelter Evaluation Model ---
class CandidateShelter(BaseModel):
    shelter_id: str
    shelter_name: str
    alias: Optional[str] = None
    distance_km: float
    elevation_meters: float
    total_capacity: int
    available_capacity: int
    remaining_headroom: int
    status: str
    is_suitable: bool
    suitability_score: float
    rank: int
    route_status: str

# --- Full Village Assessment Response (Sections 14 & 15) ---
class FinalEvacuationRecommendation(BaseModel):
    target_shelter_id: Optional[str]
    target_shelter_name: Optional[str]
    target_shelter_capacity: Optional[int]
    remaining_headroom: Optional[int]
    evacuation_urgency: str
    recommended_action: str
    transit_distance_km: Optional[float]
    summary: str

class VillageAssessmentResponse(BaseModel):
    village_id: str
    village_name: str
    alias: Optional[str] = None
    district: str
    coordinates: Coordinates
    population: int
    risk_score: float
    risk_percentage: str
    risk_level: str
    priority: str
    flood_risk: str
    landslide_risk: str
    vulnerability_breakdown: Dict[str, float]
    hazard_zone_intersections: List[str]
    recommended_site: Optional[str]
    recommended_site_id: Optional[str]
    site_capacity: Optional[int]
    remaining_headroom: Optional[int]
    status: str
    final_recommendation: FinalEvacuationRecommendation
    alternative_shelters: List[CandidateShelter]
    data_notice: str = DATA_SOURCE_TAG
    disclaimer: str = DATA_SOURCE_DISCLAIMER

# --- Alerts Models ---
class AlertResponse(BaseModel):
    id: str
    village_id: str
    village_name: str
    district: str
    type: str  # CRITICAL, HIGH, MODERATE
    message: str
    timestamp: str
    read: bool = False
    data_source: str = DATA_SOURCE_TAG

# --- Data Ingestion Payload ---
class IngestDataPayload(BaseModel):
    villages: Optional[List[VillageBase]] = None
    shelters: Optional[List[ShelterBase]] = None
    hazards_geojson: Optional[Dict[str, Any]] = None

class IngestionResultResponse(BaseModel):
    success: bool
    message: str
    ingested_villages_count: int
    ingested_shelters_count: int
    ingested_hazards_count: int
    timestamp: str
    data_tag: str = DATA_SOURCE_TAG

# --- Error Response Model ---
class ErrorResponse(BaseModel):
    error: str
    detail: str
    code: int
