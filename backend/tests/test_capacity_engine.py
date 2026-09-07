"""Unit tests for the Carrying Capacity Engine."""
from app.engines.capacity_engine import CapacityEngine
from app.core.constants import CapacityStatus

def test_headroom_arithmetic():
    assert CapacityEngine.calculate_headroom(3240, 5000) == 1760
    assert CapacityEngine.calculate_headroom(5000, 5000) == 0
    assert CapacityEngine.calculate_headroom(6000, 5000) == -1000

def test_overcapacity_condition():
    result = CapacityEngine.evaluate_capacity(affected_population=6000, site_capacity=5000)
    assert result["remaining_headroom"] == -1000
    assert result["status"] == CapacityStatus.OVERCAPACITY
    assert result["is_suitable"] is False
    assert result["occupancy_rate_pct"] == 120.0

def test_zero_capacity_handling():
    result = CapacityEngine.evaluate_capacity(affected_population=1000, site_capacity=0)
    assert result["status"] == CapacityStatus.UNSUITABLE
    assert result["is_suitable"] is False
