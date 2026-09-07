"""Data Ingestion and Normalization Service using Pandas and NumPy.

Validates, cleans, normalizes, and stores habitation, hazard, and shelter datasets.

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
import json
import logging
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np

from app.database.repository import Repository
from app.models.domain import HabitationEntity, RelocationSiteEntity, HazardZoneEntity
from app.data.mock_data import MOCK_VILLAGES, MOCK_SHELTERS, MOCK_HAZARD_ZONES, MOCK_ALERTS
from app.engines.risk_engine import RiskEngine

logger = logging.getLogger("suraksha_setu.ingestion")

class IngestionService:
    """Service handling multi-source data ingestion, validation, and Pandas normalization."""

    def __init__(self, repo: Repository):
        self.repo = repo

    def bootstrap_demo_data(self) -> Dict[str, int]:
        """Loads and normalizes default synthetic mock datasets into the database."""
        logger.info("Bootstrapping mock/demo datasets...")
        v_count = self.ingest_villages(MOCK_VILLAGES)
        s_count = self.ingest_shelters(MOCK_SHELTERS)
        h_count = self.ingest_hazard_zones(MOCK_HAZARD_ZONES)
        a_count = self.ingest_alerts(MOCK_ALERTS)
        logger.info(f"Demo data bootstrap complete: {v_count} villages, {s_count} shelters, {h_count} hazards, {a_count} alerts.")
        return {
            "villages": v_count,
            "shelters": s_count,
            "hazards": h_count,
            "alerts": a_count,
        }

    def ingest_villages(self, raw_villages: List[Dict[str, Any]]) -> int:
        """Validates and normalizes raw habitation records using Pandas."""
        if not raw_villages:
            return 0

        df = pd.DataFrame(raw_villages)

        # 1. Validation: Ensure required columns
        required = ["id", "name", "latitude", "longitude", "population"]
        for col in required:
            if col not in df.columns:
                raise ValueError(f"Missing mandatory column in habitation feed: '{col}'")

        # 2. Pandas / NumPy Cleaning & Imputation
        df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
        df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
        df["population"] = pd.to_numeric(df["population"], errors="coerce").fillna(0).astype(int)

        # Drop invalid coordinates
        df = df.dropna(subset=["latitude", "longitude"])
        df = df[(df["latitude"].between(-90, 90)) & (df["longitude"].between(-180, 180))]

        # Impute defaults
        if "alias" not in df.columns:
            df["alias"] = df["name"].str.lower().str.replace(" ", "-")
        if "district" not in df.columns:
            df["district"] = "Unassigned District"
        if "elevation_meters" not in df.columns:
            df["elevation_meters"] = 1200.0
        if "slope_degrees" not in df.columns:
            df["slope_degrees"] = 20.0
        if "historical_hazards_count" not in df.columns:
            df["historical_hazards_count"] = 2
        if "rainfall_mm" not in df.columns:
            df["rainfall_mm"] = 75.0
        if "soil_saturation_pct" not in df.columns:
            df["soil_saturation_pct"] = 60.0
        if "flood_risk" not in df.columns:
            df["flood_risk"] = "Moderate"
        if "landslide_risk" not in df.columns:
            df["landslide_risk"] = "Moderate"

        count = 0
        for _, row in df.iterrows():
            entity = HabitationEntity(
                id=str(row["id"]),
                name=str(row["name"]),
                alias=str(row["alias"]) if pd.notna(row["alias"]) else None,
                district=str(row["district"]),
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                population=int(row["population"]),
                elevation_meters=float(row["elevation_meters"]),
                slope_degrees=float(row["slope_degrees"]),
                historical_hazards_count=int(row["historical_hazards_count"]),
                rainfall_mm=float(row["rainfall_mm"]),
                soil_saturation_pct=float(row["soil_saturation_pct"]),
                flood_risk=str(row["flood_risk"]),
                landslide_risk=str(row["landslide_risk"]),
            )
            # Run deterministic initial risk score
            score, level, priority, _ = RiskEngine.calculate_risk(entity)
            entity.risk_score = score
            entity.risk_level = level
            entity.priority = priority

            self.repo.upsert_village(entity)
            count += 1

        return count

    def ingest_shelters(self, raw_shelters: List[Dict[str, Any]]) -> int:
        """Validates and normalizes raw shelter/relocation site records."""
        if not raw_shelters:
            return 0

        df = pd.DataFrame(raw_shelters)
        required = ["id", "name", "latitude", "longitude", "total_capacity"]
        for col in required:
            if col not in df.columns:
                raise ValueError(f"Missing mandatory column in shelter feed: '{col}'")

        df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
        df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
        df["total_capacity"] = pd.to_numeric(df["total_capacity"], errors="coerce").fillna(0).astype(int)
        
        if "available_capacity" not in df.columns:
            df["available_capacity"] = df["total_capacity"]
        else:
            df["available_capacity"] = pd.to_numeric(df["available_capacity"], errors="coerce").fillna(df["total_capacity"]).astype(int)

        # Bounds check: available capacity cannot exceed total capacity
        df["available_capacity"] = np.minimum(df["available_capacity"], df["total_capacity"])

        if "elevation_meters" not in df.columns:
            df["elevation_meters"] = 1400.0
        if "suitability_score" not in df.columns:
            df["suitability_score"] = 80.0
        if "road_access_quality" not in df.columns:
            df["road_access_quality"] = "Paved All-Weather"
        if "is_active" not in df.columns:
            df["is_active"] = True

        count = 0
        for _, row in df.iterrows():
            entity = RelocationSiteEntity(
                id=str(row["id"]),
                name=str(row["name"]),
                alias=str(row["alias"]) if ("alias" in row and pd.notna(row["alias"])) else None,
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                total_capacity=int(row["total_capacity"]),
                available_capacity=int(row["available_capacity"]),
                elevation_meters=float(row["elevation_meters"]),
                suitability_score=float(row["suitability_score"]),
                road_access_quality=str(row["road_access_quality"]),
                is_active=bool(row["is_active"]),
            )
            self.repo.upsert_shelter(entity)
            count += 1

        return count

    def ingest_hazard_zones(self, raw_zones: List[Dict[str, Any]]) -> int:
        """Ingests GeoJSON polygon hazard structures."""
        count = 0
        for item in raw_zones:
            geom = item.get("geometry")
            if not geom or not isinstance(geom, dict):
                continue
            entity = HazardZoneEntity(
                id=item["id"],
                name=item["name"],
                hazard_type=item.get("hazard_type", "General Hazard"),
                risk_level=item.get("risk_level", "Moderate"),
                geojson_geometry=geom,
                details={
                    k: v for k, v in item.items()
                    if k not in ["id", "name", "hazard_type", "risk_level", "geometry"]
                }
            )
            self.repo.upsert_hazard_zone(entity)
            count += 1
        return count

    def ingest_alerts(self, alerts: List[Dict[str, Any]]) -> int:
        """Stores alert notifications in database."""
        count = 0
        for a in alerts:
            self.repo.upsert_alert(a)
            count += 1
        return count
