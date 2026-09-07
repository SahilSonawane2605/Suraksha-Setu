"""Pytest configuration and fixtures for SURAKSHA-SETU backend tests."""
import sqlite3
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.schema import init_db
from app.database.repository import Repository
from app.services.ingestion_service import IngestionService
from app.database.connection import get_db

@pytest.fixture(scope="session")
def test_db_conn():
    """Provides a fresh in-memory SQLite database initialized with schema and demo data."""
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    init_db(conn)
    repo = Repository(conn)
    service = IngestionService(repo)
    service.bootstrap_demo_data()
    yield conn
    conn.close()

@pytest.fixture
def client(test_db_conn):
    """FastAPI TestClient with database dependency overridden to test_db_conn."""
    def override_get_db():
        try:
            yield test_db_conn
            test_db_conn.commit()
        except Exception:
            test_db_conn.rollback()
            raise

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
