"""Habitation and Village Assessment API Routes.

Implements the mandatory benchmark endpoint:
GET /api/v1/villages/{village_id}/assessment
(e.g., /api/v1/villages/village-a/assessment)

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
import sqlite3

from app.database.connection import get_db
from app.database.repository import Repository
from app.models.schemas import VillageResponse, VillageAssessmentResponse, VillageCreate
from app.engines.recommendation_engine import RecommendationEngine
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/villages", tags=["Habitations & Assessment"])

def get_repository(conn: sqlite3.Connection = Depends(get_db)) -> Repository:
    return Repository(conn)

def get_ingestion_service(conn: sqlite3.Connection = Depends(get_db)) -> IngestionService:
    repo = Repository(conn)
    return IngestionService(repo)

@router.post(
    "",
    response_model=VillageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create / Add a new habitation",
    description="Registers a new village, computes risk parameters, persists to database, and returns calculated risk level."
)
def create_village(
    village_in: VillageCreate,
    service: IngestionService = Depends(get_ingestion_service),
    repo: Repository = Depends(get_repository)
):
    v_dict = village_in.model_dump()
    service.ingest_villages([v_dict])
    v = repo.get_village_by_id_or_alias(village_in.id)
    if not v:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist and retrieve new village record."
        )
    return VillageResponse(
        id=v.id,
        name=v.name,
        alias=v.alias,
        district=v.district,
        latitude=v.latitude,
        longitude=v.longitude,
        population=v.population,
        elevation_meters=v.elevation_meters,
        slope_degrees=v.slope_degrees,
        historical_hazards_count=v.historical_hazards_count,
        rainfall_mm=v.rainfall_mm,
        soil_saturation_pct=v.soil_saturation_pct,
        risk_score=v.risk_score,
        risk_level=v.risk_level,
        priority=v.priority,
        flood_risk=v.flood_risk,
        landslide_risk=v.landslide_risk,
    )


@router.get(
    "",
    response_model=List[VillageResponse],
    summary="List all habitations",
    description="Returns all monitored habitations with calculated risk scores, risk levels, and priorities."
)
def list_villages(repo: Repository = Depends(get_repository)):
    entities = repo.get_all_villages()
    return [
        VillageResponse(
            id=v.id,
            name=v.name,
            alias=v.alias,
            district=v.district,
            latitude=v.latitude,
            longitude=v.longitude,
            population=v.population,
            elevation_meters=v.elevation_meters,
            slope_degrees=v.slope_degrees,
            historical_hazards_count=v.historical_hazards_count,
            rainfall_mm=v.rainfall_mm,
            soil_saturation_pct=v.soil_saturation_pct,
            risk_score=v.risk_score,
            risk_level=v.risk_level,
            priority=v.priority,
            flood_risk=v.flood_risk,
            landslide_risk=v.landslide_risk,
        )
        for v in entities
    ]

@router.get(
    "/{village_id}",
    response_model=VillageResponse,
    summary="Get single habitation details",
    description="Retrieves a village by its ID, alias (e.g. 'village-a'), or name."
)
def get_village(village_id: str, repo: Repository = Depends(get_repository)):
    v = repo.get_village_by_id_or_alias(village_id)
    if not v:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Habitation with identifier '{village_id}' not found."
        )
    return VillageResponse(
        id=v.id,
        name=v.name,
        alias=v.alias,
        district=v.district,
        latitude=v.latitude,
        longitude=v.longitude,
        population=v.population,
        elevation_meters=v.elevation_meters,
        slope_degrees=v.slope_degrees,
        historical_hazards_count=v.historical_hazards_count,
        rainfall_mm=v.rainfall_mm,
        soil_saturation_pct=v.soil_saturation_pct,
        risk_score=v.risk_score,
        risk_level=v.risk_level,
        priority=v.priority,
        flood_risk=v.flood_risk,
        landslide_risk=v.landslide_risk,
    )

@router.get(
    "/{village_id}/assessment",
    response_model=VillageAssessmentResponse,
    summary="Generate comprehensive disaster assessment for a village",
    description=(
        "Executes the full SURAKSHA-SETU emergency pipeline: "
        "Hazard Ingestion -> Risk Engine (Score & Level) -> Priority -> "
        "Spatial/GIS Analysis -> 5-Stage Relocation Engine -> Carrying Capacity Check -> "
        "Final Evacuation Recommendation."
    )
)
def get_village_assessment(village_id: str, repo: Repository = Depends(get_repository)):
    village = repo.get_village_by_id_or_alias(village_id)
    if not village:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Habitation '{village_id}' not found in database. Check identifier or seed demo data."
        )

    shelters = repo.get_all_shelters(active_only=True)
    hazard_zones = repo.get_all_hazard_zones()

    # Pass through full Recommendation and Decision Pipeline
    assessment = RecommendationEngine.generate_assessment(
        village=village,
        shelters=shelters,
        hazard_zones=hazard_zones
    )

    # Persist audit record in assessment_logs table
    repo.log_assessment(
        village_id=village.id,
        risk_score=assessment.risk_score,
        risk_level=assessment.risk_level,
        priority=assessment.priority,
        recommended_shelter_id=assessment.recommended_site_id,
        population=village.population,
        capacity=assessment.site_capacity,
        headroom=assessment.remaining_headroom,
        status=assessment.status,
        payload_dict=assessment.model_dump()
    )

    return assessment
