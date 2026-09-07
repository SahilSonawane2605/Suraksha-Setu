"""Relocation Analysis Engine.

Implements the 5-stage shelter matching and evaluation algorithm:
STEP 1 — IDENTIFY: Scan nearby secure relocation sites.
STEP 2 — COMPARE: Evaluate candidate sites using distance, elevation, terrain.
STEP 3 — CHECK CAPACITY: Verify whether shelter can accommodate affected population.
STEP 4 — EVALUATE SUITABILITY: Assess access routes and overall relocation suitability.
STEP 5 — RANK & RECOMMEND: Rank suitable relocation sites and output optimal shelter.

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import List, Optional, Tuple, Dict, Any
from app.models.domain import HabitationEntity, RelocationSiteEntity
from app.models.schemas import CandidateShelter
from app.engines.spatial_engine import haversine_distance
from app.engines.capacity_engine import CapacityEngine
from app.core.constants import CapacityStatus

class RelocationEngine:
    """Multi-stage Evacuation Routing and Shelter Relocation Engine."""

    # Search radius limit in km for candidate scanning
    DEFAULT_MAX_SEARCH_RADIUS_KM: float = 60.0

    @classmethod
    def analyze_relocation_sites(
        cls,
        village: HabitationEntity,
        shelters: List[RelocationSiteEntity],
        max_radius_km: float = DEFAULT_MAX_SEARCH_RADIUS_KM
    ) -> List[CandidateShelter]:
        """Runs the 5-stage relocation evaluation for a vulnerable habitation."""
        
        # STEP 1 — IDENTIFY: Scan nearby active relocation sites
        candidates: List[Tuple[RelocationSiteEntity, float]] = []
        for s in shelters:
            if not s.is_active:
                continue
            dist_km = haversine_distance(village.latitude, village.longitude, s.latitude, s.longitude)
            if dist_km <= max_radius_km:
                candidates.append((s, dist_km))

        # If no shelters in radius, expand to all active shelters
        if not candidates:
            for s in shelters:
                if s.is_active:
                    dist_km = haversine_distance(village.latitude, village.longitude, s.latitude, s.longitude)
                    candidates.append((s, dist_km))

        evaluated: List[Dict[str, Any]] = []

        for site, dist_km in candidates:
            # STEP 2 — COMPARE: Distance, Elevation delta, Terrain
            elevation_diff = site.elevation_meters - village.elevation_meters
            
            # STEP 3 — CHECK CAPACITY: Run capacity check
            # For assessment matching, compare affected population against available capacity
            # (or total capacity if site is designated for full evacuation)
            capacity_audit = CapacityEngine.evaluate_capacity(
                affected_population=village.population,
                site_capacity=site.total_capacity
            )

            # STEP 4 — EVALUATE SUITABILITY: Assess route and weighted multi-criteria score
            # Higher suitability if:
            # - closer distance
            # - positive headroom
            # - good infrastructure score
            # - safe elevation
            route_status = f"Clear - {site.road_access_quality}"
            
            # Proximity penalty: 1.5 points deducted per km
            dist_score = max(100.0 - (dist_km * 1.5), 10.0)
            
            # Capacity bonus: positive headroom adds up to 20 points
            headroom = capacity_audit["remaining_headroom"]
            capacity_score = 25.0 if headroom >= 0 else -50.0

            # Composite routing utility score
            utility_score = (
                (site.suitability_score * 0.45) +
                (dist_score * 0.35) +
                (capacity_score * 0.20)
            )

            evaluated.append({
                "site": site,
                "distance_km": dist_km,
                "elevation_diff": elevation_diff,
                "capacity_audit": capacity_audit,
                "route_status": route_status,
                "utility_score": round(utility_score, 2),
            })

        # STEP 5 — RANK & RECOMMEND: Sort by capacity suitability first, then utility score
        # Suitable sites (headroom >= 0) are always ranked above overcapacity sites
        evaluated.sort(
            key=lambda x: (
                1 if x["capacity_audit"]["is_suitable"] else 0,
                x["utility_score"]
            ),
            reverse=True
        )

        # Build structured CandidateShelter models with rank
        ranked_candidates: List[CandidateShelter] = []
        for rank, item in enumerate(evaluated, start=1):
            site = item["site"]
            audit = item["capacity_audit"]
            ranked_candidates.append(CandidateShelter(
                shelter_id=site.id,
                shelter_name=site.name,
                alias=site.alias,
                distance_km=item["distance_km"],
                elevation_meters=site.elevation_meters,
                total_capacity=site.total_capacity,
                available_capacity=site.available_capacity,
                remaining_headroom=audit["remaining_headroom"],
                status=audit["status"],
                is_suitable=audit["is_suitable"],
                suitability_score=site.suitability_score,
                rank=rank,
                route_status=item["route_status"]
            ))

        return ranked_candidates

    @classmethod
    def get_optimal_shelter(
        cls,
        candidates: List[CandidateShelter]
    ) -> Optional[CandidateShelter]:
        """Returns the top ranked suitable shelter, or fallback top candidate."""
        if not candidates:
            return None
        # Return first suitable candidate if available
        for c in candidates:
            if c.is_suitable:
                return c
        return candidates[0]
