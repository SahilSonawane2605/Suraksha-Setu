"""Carrying Capacity Engine.

Verifies shelter capacity against affected evacuation population:
Remaining Headroom = Site Capacity - Affected Population

Benchmark Requirement:
Population: 3,240
Site Capacity: 5,000
Remaining Headroom: +1,760
Status: Suitable

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import Dict, Any
from app.core.constants import CapacityStatus

class CapacityEngine:
    """Dedicated Headroom and Shelter Carrying-Capacity Evaluation Engine."""

    @staticmethod
    def calculate_headroom(affected_population: int, site_capacity: int) -> int:
        """Calculates remaining headroom: Site Capacity - Affected Population."""
        return site_capacity - affected_population

    @classmethod
    def evaluate_capacity(cls, affected_population: int, site_capacity: int) -> Dict[str, Any]:
        """Performs full capacity audit and returns structured metrics."""
        if site_capacity <= 0:
            return {
                "affected_population": affected_population,
                "site_capacity": site_capacity,
                "remaining_headroom": -affected_population,
                "occupancy_rate_pct": 0.0,
                "status": CapacityStatus.UNSUITABLE,
                "is_suitable": False,
            }

        remaining_headroom = cls.calculate_headroom(affected_population, site_capacity)
        occupancy_rate = round((affected_population / float(site_capacity)) * 100.0, 1)

        is_suitable = remaining_headroom >= 0
        status = CapacityStatus.SUITABLE if is_suitable else CapacityStatus.OVERCAPACITY

        return {
            "affected_population": affected_population,
            "site_capacity": site_capacity,
            "remaining_headroom": remaining_headroom,
            "occupancy_rate_pct": occupancy_rate,
            "status": status,
            "is_suitable": is_suitable,
        }
