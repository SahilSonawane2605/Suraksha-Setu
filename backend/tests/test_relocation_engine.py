"""Unit tests for the 5-Stage Relocation Analysis Engine."""
from app.engines.relocation_engine import RelocationEngine
from app.models.domain import HabitationEntity, RelocationSiteEntity

def test_relocation_ranking_and_capacity():
    village = HabitationEntity(
        id="V_TEST",
        name="Test Hilltop",
        alias="test-hilltop",
        district="District T",
        latitude=30.380,
        longitude=78.110,
        population=3000,
    )
    # Site 1: Close, capacity 2000 (Overcapacity: headroom -1000)
    site_small = RelocationSiteEntity(
        id="S_SMALL",
        name="Small Camp",
        alias="small-camp",
        latitude=30.370,
        longitude=78.100,
        total_capacity=2000,
        available_capacity=2000,
        suitability_score=90.0,
    )
    # Site 2: Further, capacity 5000 (Suitable: headroom +2000)
    site_large = RelocationSiteEntity(
        id="S_LARGE",
        name="Large Base",
        alias="large-base",
        latitude=30.300,
        longitude=78.080,
        total_capacity=5000,
        available_capacity=5000,
        suitability_score=85.0,
    )

    candidates = RelocationEngine.analyze_relocation_sites(village, [site_small, site_large])
    assert len(candidates) == 2

    # Verify suitable site is prioritized and ranked #1 despite greater distance
    optimal = RelocationEngine.get_optimal_shelter(candidates)
    assert optimal.shelter_id == "S_LARGE"
    assert optimal.is_suitable is True
    assert optimal.remaining_headroom == 2000
