"""Hazard Zones and GIS API Routes.

Exposes GeoJSON FeatureCollections for flood zones, landslide zones, and point intersection tests.

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.database.repository import Repository
from app.engines.spatial_engine import SpatialEngine
from app.models.schemas import Coordinates
from app.core.constants import DATA_SOURCE_TAG

router = APIRouter(prefix="/hazards", tags=["Hazard Zones & GIS"])

def get_repository(conn: sqlite3.Connection = Depends(get_db)) -> Repository:
    return Repository(conn)

@router.get(
    "",
    summary="Get all hazard zones as standard GeoJSON FeatureCollection",
    description="Returns flood and landslide hazard zones compatible with Leaflet/MapLibre."
)
def get_all_hazards(repo: Repository = Depends(get_repository)) -> Dict[str, Any]:
    zones = repo.get_all_hazard_zones()
    features = []
    for z in zones:
        props = {
            "id": z.id,
            "name": z.name,
            "hazardType": z.hazard_type,
            "riskLevel": z.risk_level,
            "dataSource": DATA_SOURCE_TAG,
        }
        props.update(z.details)
        features.append({
            "type": "Feature",
            "properties": props,
            "geometry": z.geojson_geometry,
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "dataSource": DATA_SOURCE_TAG,
            "count": len(features)
        }
    }

@router.post(
    "/check-intersection",
    summary="Spatial point-in-polygon risk zone intersection",
    description="Checks whether given coordinates fall within any active hazard polygons."
)
def check_point_intersection(coords: Coordinates, repo: Repository = Depends(get_repository)) -> Dict[str, Any]:
    zones = repo.get_all_hazard_zones()
    intersecting_zones = []

    for z in zones:
        inside = SpatialEngine.is_point_in_zone(coords.latitude, coords.longitude, z.geojson_geometry)
        dist_km = SpatialEngine.distance_to_zone_boundary_km(coords.latitude, coords.longitude, z.geojson_geometry)
        if inside or dist_km <= 2.5:
            intersecting_zones.append({
                "zone_id": z.id,
                "name": z.name,
                "hazard_type": z.hazard_type,
                "risk_level": z.risk_level,
                "inside": inside,
                "distance_km": dist_km,
            })

    return {
        "latitude": coords.latitude,
        "longitude": coords.longitude,
        "is_threatened": len(intersecting_zones) > 0,
        "hazard_matches": intersecting_zones,
        "data_source": DATA_SOURCE_TAG,
    }
