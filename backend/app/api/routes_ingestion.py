"""Data Ingestion and Normalization API Routes.

Allows ingestion of raw structured inputs and management of demo synthetic data.

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.database.repository import Repository
from app.services.ingestion_service import IngestionService
from app.models.schemas import IngestDataPayload, IngestionResultResponse

router = APIRouter(prefix="/ingest", tags=["Data Ingestion & Normalization"])

def get_service(conn: sqlite3.Connection = Depends(get_db)) -> IngestionService:
    repo = Repository(conn)
    return IngestionService(repo)

@router.post(
    "",
    response_model=IngestionResultResponse,
    summary="Ingest new raw habitation, shelter, or hazard data",
    description="Ingests, validates, normalizes via Pandas/NumPy, and stores records in the database."
)
def ingest_data(payload: IngestDataPayload, service: IngestionService = Depends(get_service)):
    v_count = 0
    s_count = 0
    h_count = 0

    if payload.villages:
        raw_v = [v.model_dump() for v in payload.villages]
        v_count = service.ingest_villages(raw_v)

    if payload.shelters:
        raw_s = [s.model_dump() for s in payload.shelters]
        s_count = service.ingest_shelters(raw_s)

    if payload.hazards_geojson and "features" in payload.hazards_geojson:
        raw_h = []
        for feat in payload.hazards_geojson["features"]:
            props = feat.get("properties", {})
            raw_h.append({
                "id": props.get("id", "HZ_CUSTOM"),
                "name": props.get("name", "Custom Zone"),
                "hazard_type": props.get("hazardType", "General"),
                "risk_level": props.get("riskLevel", "Moderate"),
                "geometry": feat.get("geometry", {}),
            })
        h_count = service.ingest_hazard_zones(raw_h)

    return IngestionResultResponse(
        success=True,
        message="Data successfully ingested, normalized, and stored.",
        ingested_villages_count=v_count,
        ingested_shelters_count=s_count,
        ingested_hazards_count=h_count,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

@router.post(
    "/bootstrap-demo",
    response_model=IngestionResultResponse,
    summary="Seed database with synthetic DEMO datasets",
    description="Populates the database with the SIH benchmark demo dataset (Village A, Shelter B, etc.)."
)
def bootstrap_demo_data(service: IngestionService = Depends(get_service)):
    counts = service.bootstrap_demo_data()
    return IngestionResultResponse(
        success=True,
        message="Demo datasets bootstrapped successfully.",
        ingested_villages_count=counts["villages"],
        ingested_shelters_count=counts["shelters"],
        ingested_hazards_count=counts["hazards"],
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
