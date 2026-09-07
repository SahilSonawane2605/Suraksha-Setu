"""Risk Analysis Engine.

Implements deterministic multi-factor vulnerability assessment:
- Flood susceptibility
- Landslide susceptibility
- Rainfall intensity
- Environmental triggers (soil saturation)
- Terrain slope
- Geographic elevation factor
- Historical hazard occurrence
- Population vulnerability metric

Transforms:
Risk Factors -> Risk Score (0-100) -> Risk Level -> Priority Tier

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import Dict, Any, Tuple
from app.core.constants import RiskLevel, PriorityLevel, RISK_THRESHOLDS
from app.models.domain import HabitationEntity

SUSCEPTIBILITY_MAP: Dict[str, float] = {
    "Critical": 1.0,
    "High": 0.75,
    "Moderate": 0.50,
    "Low": 0.25,
    "Safe": 0.05,
}

class RiskEngine:
    """Deterministic Multi-Factor Disaster Risk Evaluation Engine."""

    # Explicit factor weights (Sum = 1.0)
    WEIGHT_LANDSLIDE: float = 0.25
    WEIGHT_FLOOD: float = 0.15
    WEIGHT_RAINFALL: float = 0.20
    WEIGHT_SOIL_SATURATION: float = 0.10
    WEIGHT_TERRAIN_SLOPE: float = 0.15
    WEIGHT_HISTORICAL: float = 0.10
    WEIGHT_POPULATION: float = 0.05

    @classmethod
    def calculate_risk(cls, village: HabitationEntity) -> Tuple[float, str, str, Dict[str, float]]:
        """Calculates normalized risk score (0-100), risk tier, priority level, and factor breakdown.

        Deterministic rule-based formula designed for disaster scenario simulation.
        """
        # 1. Landslide susceptibility (0.0 to 1.0)
        landslide_factor = SUSCEPTIBILITY_MAP.get(village.landslide_risk, 0.25)

        # 2. Flood susceptibility (0.0 to 1.0)
        flood_factor = SUSCEPTIBILITY_MAP.get(village.flood_risk, 0.25)

        # 3. Rainfall intensity factor (Normalized to max 150mm baseline)
        rain_factor = min(village.rainfall_mm / 150.0, 1.0)

        # 4. Environmental trigger: Soil saturation (0-100% -> 0.0 to 1.0)
        soil_factor = min(village.soil_saturation_pct / 100.0, 1.0)

        # 5. Terrain slope factor (Normalized to 47.0 degree severe threshold)
        slope_factor = min(village.slope_degrees / 47.0, 1.0)

        # 6. Historical hazard frequency (Normalized to 5 events)
        hist_factor = min(village.historical_hazards_count / 5.0, 1.0)

        # 7. Population vulnerability factor (Normalized to 5,000 residents)
        pop_factor = min(village.population / 5000.0, 1.0)

        # Weighted calculation
        raw_score = (
            cls.WEIGHT_LANDSLIDE * landslide_factor +
            cls.WEIGHT_FLOOD * flood_factor +
            cls.WEIGHT_RAINFALL * rain_factor +
            cls.WEIGHT_SOIL_SATURATION * soil_factor +
            cls.WEIGHT_TERRAIN_SLOPE * slope_factor +
            cls.WEIGHT_HISTORICAL * hist_factor +
            cls.WEIGHT_POPULATION * pop_factor
        ) * 100.0

        risk_score = round(min(max(raw_score, 0.0), 100.0), 1)

        # Classify Risk Level
        risk_level = cls.determine_risk_level(risk_score)

        # Classify Priority Level
        priority = cls.determine_priority_level(risk_level)

        breakdown = {
            "landslide_factor": round(landslide_factor, 3),
            "flood_factor": round(flood_factor, 3),
            "rainfall_factor": round(rain_factor, 3),
            "soil_saturation_factor": round(soil_factor, 3),
            "terrain_slope_factor": round(slope_factor, 3),
            "historical_hazard_factor": round(hist_factor, 3),
            "population_density_factor": round(pop_factor, 3),
        }

        return risk_score, risk_level, priority, breakdown

    @staticmethod
    def determine_risk_level(score: float) -> str:
        """Translates numerical score into categorical risk tier."""
        if score >= RISK_THRESHOLDS["CRITICAL"]:
            return RiskLevel.CRITICAL
        elif score >= RISK_THRESHOLDS["HIGH"]:
            return RiskLevel.HIGH
        elif score >= RISK_THRESHOLDS["MODERATE"]:
            return RiskLevel.MODERATE
        elif score >= RISK_THRESHOLDS["LOW"]:
            return RiskLevel.LOW
        else:
            return RiskLevel.SAFE

    @staticmethod
    def determine_priority_level(risk_level: str) -> str:
        """Translates risk level into immediate disaster mitigation priority."""
        if risk_level == RiskLevel.CRITICAL:
            return PriorityLevel.IMMEDIATE_ACTION
        elif risk_level == RiskLevel.HIGH:
            return PriorityLevel.HIGH_PRIORITY
        elif risk_level == RiskLevel.MODERATE:
            return PriorityLevel.PROACTIVE_MONITORING
        elif risk_level == RiskLevel.LOW:
            return PriorityLevel.ADVISORY_STANDBY
        else:
            return PriorityLevel.NORMAL
