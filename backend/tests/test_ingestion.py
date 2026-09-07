"""Unit and API tests for Data Ingestion and Normalization."""
import pytest
from app.services.ingestion_service import IngestionService
from app.database.repository import Repository

def test_ingestion_validation_and_normalization(test_db_conn):
    repo = Repository(test_db_conn)
    service = IngestionService(repo)

    # Valid village ingestion
    raw_sample = [
        {
            "id": "V_NEW_01",
            "name": "New High Plateau",
            "latitude": 30.40,
            "longitude": 78.20,
            "population": 1500,
            "rainfall_mm": 120.0,
            "slope_degrees": 35.0,
            "flood_risk": "Moderate",
            "landslide_risk": "High"
        }
    ]
    count = service.ingest_villages(raw_sample)
    assert count == 1

    stored = repo.get_village_by_id_or_alias("V_NEW_01")
    assert stored is not None
    assert stored.population == 1500
    assert stored.risk_score > 50.0

def test_ingestion_missing_mandatory_field(test_db_conn):
    repo = Repository(test_db_conn)
    service = IngestionService(repo)

    invalid_sample = [
        {
            "name": "Incomplete Village Without ID",
            "latitude": 30.40,
            "longitude": 78.20
        }
    ]
    with pytest.raises(ValueError) as exc:
        service.ingest_villages(invalid_sample)
    assert "Missing mandatory column" in str(exc.value)
