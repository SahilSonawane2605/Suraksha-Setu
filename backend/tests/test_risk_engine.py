"""Unit tests for the Risk Analysis Engine."""
from app.engines.risk_engine import RiskEngine
from app.models.domain import HabitationEntity
from app.core.constants import RiskLevel, PriorityLevel

def test_safe_village_risk_scoring():
    """Verify low environmental and terrain factors yield Safe risk level and Normal priority."""
    safe_village = HabitationEntity(
        id="SAFE_01",
        name="Valley Safe Haven",
        alias="safe-haven",
        district="District Safe",
        latitude=30.2,
        longitude=78.1,
        population=500,
        elevation_meters=400.0,
        slope_degrees=3.0,
        historical_hazards_count=0,
        rainfall_mm=15.0,
        soil_saturation_pct=15.0,
        flood_risk="Safe",
        landslide_risk="Safe",
    )
    score, level, priority, breakdown = RiskEngine.calculate_risk(safe_village)
    assert score < 20.0
    assert level == RiskLevel.SAFE
    assert priority == PriorityLevel.NORMAL
    assert "landslide_factor" in breakdown

def test_risk_level_thresholds():
    """Verify tier assignment across all threshold boundaries."""
    assert RiskEngine.determine_risk_level(95.0) == RiskLevel.CRITICAL
    assert RiskEngine.determine_risk_level(80.0) == RiskLevel.CRITICAL
    assert RiskEngine.determine_risk_level(79.9) == RiskLevel.HIGH
    assert RiskEngine.determine_risk_level(60.0) == RiskLevel.HIGH
    assert RiskEngine.determine_risk_level(59.9) == RiskLevel.MODERATE
    assert RiskEngine.determine_risk_level(40.0) == RiskLevel.MODERATE
    assert RiskEngine.determine_risk_level(39.9) == RiskLevel.LOW
    assert RiskEngine.determine_risk_level(20.0) == RiskLevel.LOW
    assert RiskEngine.determine_risk_level(19.9) == RiskLevel.SAFE
