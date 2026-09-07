"""Final Recommendation Engine.

Synthesizes the complete end-to-end disaster management pipeline:
RAW DATA -> PROCESSED DATA -> RISK SCORE -> PRIORITY -> GIS/SPATIAL -> RELOCATION -> CAPACITY CHECK -> FINAL RECOMMENDATION

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import List, Optional
from app.models.domain import HabitationEntity, RelocationSiteEntity, HazardZoneEntity
from app.models.schemas import (
    VillageAssessmentResponse,
    FinalEvacuationRecommendation,
    Coordinates,
    CandidateShelter,
)
from app.engines.risk_engine import RiskEngine
from app.engines.spatial_engine import SpatialEngine
from app.engines.relocation_engine import RelocationEngine
from app.core.constants import RiskLevel, PriorityLevel, CapacityStatus

class RecommendationEngine:
    """End-to-End Disaster Mitigation and Evacuation Recommendation Coordinator."""

    @classmethod
    def generate_assessment(
        cls,
        village: HabitationEntity,
        shelters: List[RelocationSiteEntity],
        hazard_zones: List[HazardZoneEntity]
    ) -> VillageAssessmentResponse:
        """Executes full analytical workflow for a single village."""

        # 1. RISK ANALYSIS & CLASSIFICATION
        risk_score, risk_level, priority, breakdown = RiskEngine.calculate_risk(village)

        # 2. GIS / SPATIAL ANALYSIS
        hazard_relationships = SpatialEngine.evaluate_village_hazard_relationships(village, hazard_zones)
        intersecting_hazard_ids = [
            f"{r['zone_name']} ({r['hazard_type']}: {r['risk_level']})"
            for r in hazard_relationships
            if r["is_inside"] or r["in_buffer_zone"]
        ]

        # 3. RELOCATION & CAPACITY ANALYSIS (5-Stage Evaluation)
        candidates = RelocationEngine.analyze_relocation_sites(village, shelters)
        optimal_candidate: Optional[CandidateShelter] = RelocationEngine.get_optimal_shelter(candidates)

        # Determine overall evacuation posture
        if optimal_candidate and optimal_candidate.is_suitable:
            recommended_site_name = optimal_candidate.shelter_name
            recommended_site_id = optimal_candidate.shelter_id
            site_capacity = optimal_candidate.total_capacity
            remaining_headroom = optimal_candidate.remaining_headroom
            status = CapacityStatus.SUITABLE
            
            if risk_level == RiskLevel.CRITICAL:
                urgency = "IMMEDIATE"
                action_text = f"Initiate immediate priority convoy dispatch to {recommended_site_name} via designated transit corridor."
            elif risk_level == RiskLevel.HIGH:
                urgency = "HIGH"
                action_text = f"Issue stage-1 advisory and pre-stage transit logistics for evacuation to {recommended_site_name}."
            else:
                urgency = "STANDBY"
                action_text = f"Maintain local standby monitoring. Primary shelter contingency allocated at {recommended_site_name}."

            summary = (
                f"Habitation '{village.name}' is assessed at {risk_score}% ({risk_level}) threat level. "
                f"Assigned to {recommended_site_name} with capacity of {site_capacity:,} evacuees, leaving "
                f"+{remaining_headroom:,} available headroom ({status})."
            )
        else:
            # Overcapacity or no site found
            recommended_site_name = optimal_candidate.shelter_name if optimal_candidate else "No Single Facility Sufficient"
            recommended_site_id = optimal_candidate.shelter_id if optimal_candidate else None
            site_capacity = optimal_candidate.total_capacity if optimal_candidate else 0
            remaining_headroom = optimal_candidate.remaining_headroom if optimal_candidate else -village.population
            status = CapacityStatus.OVERCAPACITY
            urgency = "CRITICAL_OVERFLOW"
            action_text = "Split evacuation cohort across multiple secondary safe sites. Immediate coordination required."
            summary = (
                f"Habitation '{village.name}' risk is {risk_score}% ({risk_level}). "
                f"Nearby shelter capacity insufficient ({status}). Headroom deficit: {abs(remaining_headroom):,} individuals."
            )

        final_rec = FinalEvacuationRecommendation(
            target_shelter_id=recommended_site_id,
            target_shelter_name=recommended_site_name,
            target_shelter_capacity=site_capacity,
            remaining_headroom=remaining_headroom,
            evacuation_urgency=urgency,
            recommended_action=action_text,
            transit_distance_km=optimal_candidate.distance_km if optimal_candidate else None,
            summary=summary,
        )

        return VillageAssessmentResponse(
            village_id=village.id,
            village_name=village.name,
            alias=village.alias,
            district=village.district,
            coordinates=Coordinates(latitude=village.latitude, longitude=village.longitude),
            population=village.population,
            risk_score=risk_score,
            risk_percentage=f"{int(round(risk_score))}%",
            risk_level=risk_level,
            priority=priority,
            flood_risk=village.flood_risk,
            landslide_risk=village.landslide_risk,
            vulnerability_breakdown=breakdown,
            hazard_zone_intersections=intersecting_hazard_ids,
            recommended_site=recommended_site_name,
            recommended_site_id=recommended_site_id,
            site_capacity=site_capacity,
            remaining_headroom=remaining_headroom,
            status=status,
            final_recommendation=final_rec,
            alternative_shelters=candidates,
        )
