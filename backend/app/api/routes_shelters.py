"""Relocation Sites and Carrying Capacity API Routes.

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
import sqlite3

from app.database.connection import get_db
from app.database.repository import Repository
from app.models.schemas import ShelterResponse, CapacityCheckRequest, CapacityCheckResponse
from app.engines.capacity_engine import CapacityEngine

router = APIRouter(prefix="/shelters", tags=["Relocation Sites & Capacity"])

def get_repository(conn: sqlite3.Connection = Depends(get_db)) -> Repository:
    return Repository(conn)

@router.get(
    "",
    response_model=List[ShelterResponse],
    summary="List all candidate shelters",
    description="Returns all active relocation shelters with total and available capacities."
)
def list_shelters(repo: Repository = Depends(get_repository)):
    entities = repo.get_all_shelters(active_only=False)
    return [
        ShelterResponse(
            id=s.id,
            name=s.name,
            alias=s.alias,
            latitude=s.latitude,
            longitude=s.longitude,
            total_capacity=s.total_capacity,
            available_capacity=s.available_capacity,
            elevation_meters=s.elevation_meters,
            suitability_score=s.suitability_score,
            road_access_quality=s.road_access_quality,
            is_active=s.is_active,
        )
        for s in entities
    ]

@router.get(
    "/{shelter_id}",
    response_model=ShelterResponse,
    summary="Get single shelter details",
    description="Retrieves a relocation shelter by its ID, alias (e.g. 'shelter-b'), or name."
)
def get_shelter(shelter_id: str, repo: Repository = Depends(get_repository)):
    s = repo.get_shelter_by_id_or_alias(shelter_id)
    if not s:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shelter with identifier '{shelter_id}' not found."
        )
    return ShelterResponse(
        id=s.id,
        name=s.name,
        alias=s.alias,
        latitude=s.latitude,
        longitude=s.longitude,
        total_capacity=s.total_capacity,
        available_capacity=s.available_capacity,
        elevation_meters=s.elevation_meters,
        suitability_score=s.suitability_score,
        road_access_quality=s.road_access_quality,
        is_active=s.is_active,
    )

@router.post(
    "/check-capacity",
    response_model=CapacityCheckResponse,
    summary="Perform carrying capacity check",
    description=(
        "Dedicated Carrying Capacity calculation endpoint: "
        "Remaining Headroom = Site Capacity - Affected Population."
    )
)
def check_capacity(req: CapacityCheckRequest):
    result = CapacityEngine.evaluate_capacity(
        affected_population=req.affected_population,
        site_capacity=req.site_capacity
    )
    return CapacityCheckResponse(
        affected_population=result["affected_population"],
        site_capacity=result["site_capacity"],
        remaining_headroom=result["remaining_headroom"],
        occupancy_rate_pct=result["occupancy_rate_pct"],
        status=result["status"],
        is_suitable=result["is_suitable"],
    )
