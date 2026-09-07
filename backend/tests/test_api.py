"""Integration tests for FastAPI REST endpoints."""

def test_root_and_health(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["sih_statement"] == "SIH26191"
    assert "Sahil & Swara" in data["backend_team"]

    res_h = client.get("/health")
    assert res_h.status_code == 200
    assert res_h.json()["status"] == "healthy"

def test_list_villages(client):
    res = client.get("/api/v1/villages")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 15
    # Verify first village is sorted by risk score
    assert data[0]["risk_score"] >= data[-1]["risk_score"]

def test_get_village_by_id_and_404(client):
    res = client.get("/api/v1/villages/V01")
    assert res.status_code == 200
    assert res.json()["id"] == "V01"

    # Test not found
    res_404 = client.get("/api/v1/villages/UNKNOWN_VILLAGE")
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()

def test_shelters_and_capacity_check(client):
    res = client.get("/api/v1/shelters")
    assert res.status_code == 200
    shelters = res.json()
    assert len(shelters) >= 6

    # Capacity Check POST
    payload = {
        "affected_population": 3240,
        "site_capacity": 5000,
        "shelter_id": "S01"
    }
    res_cap = client.post("/api/v1/shelters/check-capacity", json=payload)
    assert res_cap.status_code == 200
    cap_data = res_cap.json()
    assert cap_data["remaining_headroom"] == 1760
    assert cap_data["status"] == "Suitable"
    assert cap_data["is_suitable"] is True

def test_hazards_geojson(client):
    res = client.get("/api/v1/hazards")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 4

def test_alerts_endpoint(client):
    res = client.get("/api/v1/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) >= 5
    assert any(a["village_id"] == "V01" for a in alerts)

def test_create_village(client):
    payload = {
        "id": "VTEST_99",
        "name": "Test Village Alpha",
        "district": "Test District",
        "latitude": 30.50,
        "longitude": 78.50,
        "population": 1500,
        "elevation_meters": 1300.0,
        "slope_degrees": 25.0,
        "rainfall_mm": 120.0,
        "soil_saturation_pct": 80.0,
        "historical_hazards_count": 4
    }
    res = client.post("/api/v1/villages", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["id"] == "VTEST_99"
    assert data["name"] == "Test Village Alpha"
    assert "risk_score" in data
    assert "risk_level" in data

