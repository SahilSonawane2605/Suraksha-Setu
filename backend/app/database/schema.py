"""Database Schema Definition and Table Initialization.
"""
import sqlite3
import logging

logger = logging.getLogger("suraksha_setu.database")

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS villages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    alias TEXT,
    district TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    population INTEGER NOT NULL,
    elevation_meters REAL DEFAULT 1200.0,
    slope_degrees REAL DEFAULT 25.0,
    historical_hazards_count INTEGER DEFAULT 3,
    rainfall_mm REAL DEFAULT 85.0,
    soil_saturation_pct REAL DEFAULT 75.0,
    risk_score REAL DEFAULT 0.0,
    risk_level TEXT DEFAULT 'Safe',
    priority TEXT DEFAULT 'Normal',
    flood_risk TEXT DEFAULT 'Safe',
    landslide_risk TEXT DEFAULT 'Safe',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_villages_alias ON villages(alias);
CREATE INDEX IF NOT EXISTS idx_villages_risk ON villages(risk_score);

CREATE TABLE IF NOT EXISTS shelters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    alias TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    total_capacity INTEGER NOT NULL,
    available_capacity INTEGER NOT NULL,
    elevation_meters REAL DEFAULT 1450.0,
    suitability_score REAL DEFAULT 85.0,
    road_access_quality TEXT DEFAULT 'Paved All-Weather',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shelters_alias ON shelters(alias);

CREATE TABLE IF NOT EXISTS hazard_zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hazard_type TEXT NOT NULL,  -- 'Flood' or 'Landslide'
    risk_level TEXT NOT NULL,
    avg_depth TEXT,
    slope_angle TEXT,
    geometry_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    village_id TEXT,
    village_name TEXT NOT NULL,
    district TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessment_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id TEXT NOT NULL,
    risk_score REAL NOT NULL,
    risk_level TEXT NOT NULL,
    priority TEXT NOT NULL,
    recommended_shelter_id TEXT,
    affected_population INTEGER NOT NULL,
    site_capacity INTEGER,
    remaining_headroom INTEGER,
    status TEXT NOT NULL,
    assessment_payload_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

def init_db(conn: sqlite3.Connection) -> None:
    """Executes DDL statements to create database schema."""
    logger.info("Initializing database schema...")
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    logger.info("Database schema initialized successfully.")
