"""SURAKSHA-SETU Constants and Core Business Rules.

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import Final, Dict, Any

# Project Metadata
PROJECT_NAME: Final[str] = "SURAKSHA-SETU"
PROJECT_CODE: Final[str] = "SIH26191"
PROJECT_THEME: Final[str] = "Disaster Management"
PROJECT_TEAM: Final[str] = "Team Abhimanyu"
BACKEND_TEAM: Final[str] = "Sahil & Swara"

# Environment & Data Mode
DATA_SOURCE_TAG: Final[str] = "DEMO/MOCK/SAMPLE DATA"
DATA_SOURCE_DISCLAIMER: Final[str] = (
    "Prototype data for algorithmic verification. This is synthetic demonstration data "
    "and does not represent live authorized government disaster feeds."
)

# Risk Level Classification Rules
class RiskLevel:
    CRITICAL: Final[str] = "Critical"
    HIGH: Final[str] = "High"
    MODERATE: Final[str] = "Moderate"
    LOW: Final[str] = "Low"
    SAFE: Final[str] = "Safe"

# Priority / Action Level Rules
class PriorityLevel:
    IMMEDIATE_ACTION: Final[str] = "Immediate Action"
    HIGH_PRIORITY: Final[str] = "High Priority"
    PROACTIVE_MONITORING: Final[str] = "Proactive Monitoring"
    ADVISORY_STANDBY: Final[str] = "Advisory Standby"
    NORMAL: Final[str] = "Normal"

# Score Thresholds
RISK_THRESHOLDS: Final[Dict[str, float]] = {
    "CRITICAL": 80.0,
    "HIGH": 60.0,
    "MODERATE": 40.0,
    "LOW": 20.0,
}

# Carrying Capacity Suitability Status
class CapacityStatus:
    SUITABLE: Final[str] = "Suitable"
    OVERCAPACITY: Final[str] = "Overcapacity"
    EXHAUSTED: Final[str] = "Exhausted"
    UNSUITABLE: Final[str] = "Unsuitable"

# Default Weights for Multi-Factor Risk Calculation Engine
# Sum = 1.0 (deterministic multi-factor analytical model)
RISK_WEIGHTS: Final[Dict[str, float]] = {
    "flood_susceptibility": 0.20,
    "landslide_susceptibility": 0.25,
    "rainfall_intensity": 0.20,
    "slope_terrain_factor": 0.15,
    "elevation_factor": 0.05,
    "historical_occurrence": 0.10,
    "population_vulnerability": 0.05,
}
