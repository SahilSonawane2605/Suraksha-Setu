"""Unit tests for GIS / Spatial Processing Engine."""
from app.engines.spatial_engine import haversine_distance, SpatialEngine

def test_haversine_distance():
    # Distance between two nearby coordinates in Uttarakhand
    lat1, lon1 = 30.385, 78.115
    lat2, lon2 = 30.262, 78.095
    dist = haversine_distance(lat1, lon1, lat2, lon2)
    assert 13.0 <= dist <= 15.0  # Around ~13.8 km

def test_point_in_hazard_zone():
    # Polygon around Malana Hillside Slope Zone: [78.09, 30.37] to [78.14, 30.40]
    polygon_geom = {
        "type": "Polygon",
        "coordinates": [
            [
                [78.090, 30.400],
                [78.140, 30.400],
                [78.130, 30.370],
                [78.080, 30.370],
                [78.090, 30.400]
            ]
        ]
    }
    # Point inside (Malana Heights: lat 30.385, lon 78.115)
    assert SpatialEngine.is_point_in_zone(30.385, 78.115, polygon_geom) is True

    # Point clearly outside
    assert SpatialEngine.is_point_in_zone(30.100, 78.500, polygon_geom) is False
