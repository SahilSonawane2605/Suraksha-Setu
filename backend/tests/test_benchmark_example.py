"""Mandatory Benchmark Tests for SURAKSHA-SETU Specification.

Verifies Section 22 of Backend Requirements:
1. Carrying Capacity Benchmark:
   Population = 3,240
   Capacity = 5,000
   Remaining Headroom = 1,760
   Status = Suitable

2. Risk Engine Benchmark:
   Village A -> 86% Risk -> Critical -> Immediate Action

3. Assessment Endpoint:
   GET /api/v1/villages/village-a/assessment
   GET /api/v1/villages/V01/assessment

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from app.engines.capacity_engine import CapacityEngine
from app.engines.risk_engine import RiskEngine
from app.models.domain import HabitationEntity
from app.core.constants import RiskLevel, PriorityLevel, CapacityStatus

def test_carrying_capacity_benchmark_example():
    """Verify exact formula: Remaining Headroom = Site Capacity - Affected Population."""
    population = 3240
    capacity = 5000
    expected_headroom = 1760

    result = CapacityEngine.evaluate_capacity(
        affected_population=population,
        site_capacity=capacity
    )

    assert result["remaining_headroom"] == expected_headroom
    assert result["status"] == CapacityStatus.SUITABLE
    assert result["is_suitable"] is True
    assert result["occupancy_rate_pct"] == 64.8

def test_village_a_risk_benchmark():
    """Verify Village A produces 86% Risk -> Critical -> Immediate Action."""
    village_a = HabitationEntity(
        id="V01",
        name="Malana Heights",
        alias="village-a",
        district="District A",
        latitude=30.385,
        longitude=78.115,
        population=3240,
        elevation_meters=2240.0,
        slope_degrees=42.0,
        historical_hazards_count=5,
        rainfall_mm=135.0,
        soil_saturation_pct=88.0,
        flood_risk="Moderate",
        landslide_risk="Critical",
    )

    risk_score, risk_level, priority, breakdown = RiskEngine.calculate_risk(village_a)

    # Risk score should round to 86%
    assert round(risk_score) == 86
    assert risk_level == RiskLevel.CRITICAL
    assert priority == PriorityLevel.IMMEDIATE_ACTION

def test_village_a_assessment_endpoint(client):
    """Verify GET /api/v1/villages/village-a/assessment returns exact required parameters."""
    response = client.get("/api/v1/villages/village-a/assessment")
    assert response.status_code == 200
    data = response.json()

    # Verify Habitation & Benchmark Data
    assert data["village_id"] == "V01"
    assert data["population"] == 3240
    assert data["risk_percentage"] == "86%"
    assert data["risk_level"] == "Critical"
    assert data["priority"] == "Immediate Action"

    # Verify Relocation & Capacity Benchmark Values
    assert data["site_capacity"] == 5000
    assert data["remaining_headroom"] == 1760
    assert data["status"] == "Suitable"
    assert "Safe Site A - Shanti Camp" in data["recommended_site"] or "Shelter" in data["recommended_site"]

    # Verify structured final recommendation is present and actionable
    rec = data["final_recommendation"]
    assert rec["evacuation_urgency"] == "IMMEDIATE"
    assert rec["remaining_headroom"] == 1760
    assert rec["target_shelter_capacity"] == 5000
    assert "convoy dispatch" in rec["recommended_action"].lower()

def test_village_v01_id_endpoint(client):
    """Verify accessing via primary ID 'V01' returns equivalent assessment."""
    response = client.get("/api/v1/villages/V01/assessment")
    assert response.status_code == 200
    data = response.json()
    assert data["village_id"] == "V01"
    assert data["remaining_headroom"] == 1760
    assert data["risk_level"] == "Critical"
