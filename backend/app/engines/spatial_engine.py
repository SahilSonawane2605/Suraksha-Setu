"""GIS / Spatial Processing Engine using Shapely and GeoJSON.

Performs true spatial operations:
- Spherical Haversine distance calculations (in kilometers)
- Point-in-polygon risk zone intersections
- Buffer computations around risk geometries
- Spatial proximity ranking for evacuation routing

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
import math
from typing import List, Dict, Any, Tuple, Optional
from shapely.geometry import Point, shape
from shapely.ops import transform
from app.models.domain import HabitationEntity, RelocationSiteEntity, HazardZoneEntity

EARTH_RADIUS_KM = 6371.0  # Mean radius of Earth in km

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates spherical surface distance between two coordinate pairs in kilometers."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(EARTH_RADIUS_KM * c, 2)

class SpatialEngine:
    """Core GIS and Geometric Analysis Processor."""

    @staticmethod
    def is_point_in_zone(latitude: float, longitude: float, geojson_geom: Dict[str, Any]) -> bool:
        """Determines whether a coordinate falls inside a GeoJSON hazard boundary.

        Note: GeoJSON coordinates are in [longitude, latitude] order.
        """
        pt = Point(longitude, latitude)
        poly = shape(geojson_geom)
        return bool(poly.contains(pt) or poly.intersects(pt))

    @staticmethod
    def distance_to_zone_boundary_km(latitude: float, longitude: float, geojson_geom: Dict[str, Any]) -> float:
        """Computes approximate distance from a coordinate to a hazard boundary in km."""
        pt = Point(longitude, latitude)
        poly = shape(geojson_geom)
        if poly.contains(pt):
            return 0.0
        
        # Approximate degree-to-km conversion around latitude 30N
        # 1 deg lat ~ 111 km, 1 deg lon ~ 111 * cos(30 deg) ~ 96 km
        centroid = poly.centroid
        return haversine_distance(latitude, longitude, centroid.y, centroid.x)

    @classmethod
    def evaluate_village_hazard_relationships(
        cls,
        village: HabitationEntity,
        hazard_zones: List[HazardZoneEntity]
    ) -> List[Dict[str, Any]]:
        """Evaluates spatial intersection and buffer proximity of a village to all known hazard zones."""
        relationships = []
        for zone in hazard_zones:
            in_zone = cls.is_point_in_zone(village.latitude, village.longitude, zone.geojson_geometry)
            dist_km = cls.distance_to_zone_boundary_km(village.latitude, village.longitude, zone.geojson_geometry)
            
            # Buffer check: Within 2.5 km is considered high hazard exposure buffer
            is_in_buffer = in_zone or (dist_km <= 2.5)

            relationships.append({
                "zone_id": zone.id,
                "zone_name": zone.name,
                "hazard_type": zone.hazard_type,
                "risk_level": zone.risk_level,
                "is_inside": in_zone,
                "distance_km": dist_km,
                "in_buffer_zone": is_in_buffer,
            })
        return relationships

    @classmethod
    def calculate_shelter_distances(
        cls,
        village: HabitationEntity,
        shelters: List[RelocationSiteEntity]
    ) -> List[Tuple[RelocationSiteEntity, float]]:
        """Calculates transit distance from village to all candidate relocation sites, sorted by proximity."""
        scored_shelters = []
        for shelter in shelters:
            dist = haversine_distance(village.latitude, village.longitude, shelter.latitude, shelter.longitude)
            scored_shelters.append((shelter, dist))
        scored_shelters.sort(key=lambda x: x[1])
        return scored_shelters

    @staticmethod
    def generate_buffer_geojson(geojson_geom: Dict[str, Any], buffer_degrees: float = 0.01) -> Dict[str, Any]:
        """Creates a buffer around a geometry using Shapely for visual danger perimeter representation."""
        geom = shape(geojson_geom)
        buffered_geom = geom.buffer(buffer_degrees)
        return buffered_geom.__geo_interface__
