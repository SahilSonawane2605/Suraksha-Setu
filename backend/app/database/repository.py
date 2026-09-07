"""Data Access Layer (Repository Pattern).

Separates database access and SQL queries from engines and API routers.
"""
import json
import sqlite3
from typing import List, Optional, Dict, Any
from app.models.domain import HabitationEntity, RelocationSiteEntity, HazardZoneEntity

class Repository:
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    # --- Villages / Habitations ---
    def get_all_villages(self) -> List[HabitationEntity]:
        cursor = self.conn.execute("SELECT * FROM villages ORDER BY risk_score DESC")
        rows = cursor.fetchall()
        return [self._row_to_village(r) for r in rows]

    def get_village_by_id_or_alias(self, identifier: str) -> Optional[HabitationEntity]:
        clean_id = identifier.strip().lower()
        cursor = self.conn.execute(
            "SELECT * FROM villages WHERE LOWER(id) = ? OR LOWER(alias) = ? OR LOWER(name) = ? LIMIT 1",
            (clean_id, clean_id, clean_id)
        )
        row = cursor.fetchone()
        return self._row_to_village(row) if row else None

    def upsert_village(self, v: HabitationEntity) -> None:
        self.conn.execute(
            """
            INSERT INTO villages (
                id, name, alias, district, latitude, longitude, population,
                elevation_meters, slope_degrees, historical_hazards_count,
                rainfall_mm, soil_saturation_pct, risk_score, risk_level,
                priority, flood_risk, landslide_risk
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                alias=excluded.alias,
                district=excluded.district,
                latitude=excluded.latitude,
                longitude=excluded.longitude,
                population=excluded.population,
                elevation_meters=excluded.elevation_meters,
                slope_degrees=excluded.slope_degrees,
                historical_hazards_count=excluded.historical_hazards_count,
                rainfall_mm=excluded.rainfall_mm,
                soil_saturation_pct=excluded.soil_saturation_pct,
                risk_score=excluded.risk_score,
                risk_level=excluded.risk_level,
                priority=excluded.priority,
                flood_risk=excluded.flood_risk,
                landslide_risk=excluded.landslide_risk
            """,
            (
                v.id, v.name, v.alias, v.district, v.latitude, v.longitude, v.population,
                v.elevation_meters, v.slope_degrees, v.historical_hazards_count,
                v.rainfall_mm, v.soil_saturation_pct, v.risk_score, v.risk_level,
                v.priority, v.flood_risk, v.landslide_risk
            )
        )

    # --- Shelters / Relocation Sites ---
    def get_all_shelters(self, active_only: bool = True) -> List[RelocationSiteEntity]:
        sql = "SELECT * FROM shelters"
        if active_only:
            sql += " WHERE is_active = 1"
        sql += " ORDER BY suitability_score DESC"
        cursor = self.conn.execute(sql)
        rows = cursor.fetchall()
        return [self._row_to_shelter(r) for r in rows]

    def get_shelter_by_id_or_alias(self, identifier: str) -> Optional[RelocationSiteEntity]:
        clean_id = identifier.strip().lower()
        cursor = self.conn.execute(
            "SELECT * FROM shelters WHERE LOWER(id) = ? OR LOWER(alias) = ? OR LOWER(name) = ? LIMIT 1",
            (clean_id, clean_id, clean_id)
        )
        row = cursor.fetchone()
        return self._row_to_shelter(row) if row else None

    def upsert_shelter(self, s: RelocationSiteEntity) -> None:
        self.conn.execute(
            """
            INSERT INTO shelters (
                id, name, alias, latitude, longitude, total_capacity,
                available_capacity, elevation_meters, suitability_score,
                road_access_quality, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                alias=excluded.alias,
                latitude=excluded.latitude,
                longitude=excluded.longitude,
                total_capacity=excluded.total_capacity,
                available_capacity=excluded.available_capacity,
                elevation_meters=excluded.elevation_meters,
                suitability_score=excluded.suitability_score,
                road_access_quality=excluded.road_access_quality,
                is_active=excluded.is_active
            """,
            (
                s.id, s.name, s.alias, s.latitude, s.longitude, s.total_capacity,
                s.available_capacity, s.elevation_meters, s.suitability_score,
                s.road_access_quality, 1 if s.is_active else 0
            )
        )

    # --- Hazard Zones ---
    def get_all_hazard_zones(self) -> List[HazardZoneEntity]:
        cursor = self.conn.execute("SELECT * FROM hazard_zones")
        rows = cursor.fetchall()
        zones = []
        for r in rows:
            geom = json.loads(r["geometry_json"])
            details = {}
            if r["avg_depth"]:
                details["avgDepth"] = r["avg_depth"]
            if r["slope_angle"]:
                details["slopeAngle"] = r["slope_angle"]
            zones.append(HazardZoneEntity(
                id=r["id"],
                name=r["name"],
                hazard_type=r["hazard_type"],
                risk_level=r["risk_level"],
                geojson_geometry=geom,
                details=details
            ))
        return zones

    def upsert_hazard_zone(self, h: HazardZoneEntity) -> None:
        geom_str = json.dumps(h.geojson_geometry)
        avg_depth = h.details.get("avgDepth")
        slope_angle = h.details.get("slopeAngle")
        self.conn.execute(
            """
            INSERT INTO hazard_zones (id, name, hazard_type, risk_level, avg_depth, slope_angle, geometry_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                hazard_type=excluded.hazard_type,
                risk_level=excluded.risk_level,
                avg_depth=excluded.avg_depth,
                slope_angle=excluded.slope_angle,
                geometry_json=excluded.geometry_json
            """,
            (h.id, h.name, h.hazard_type, h.risk_level, avg_depth, slope_angle, geom_str)
        )

    # --- Alerts ---
    def get_all_alerts(self) -> List[Dict[str, Any]]:
        cursor = self.conn.execute("SELECT * FROM alerts ORDER BY id ASC")
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "village_id": r["village_id"],
                "village_name": r["village_name"],
                "district": r["district"],
                "type": r["alert_type"],
                "message": r["message"],
                "timestamp": r["timestamp"],
                "read": bool(r["is_read"])
            }
            for r in rows
        ]

    def upsert_alert(self, alert: Dict[str, Any]) -> None:
        self.conn.execute(
            """
            INSERT INTO alerts (id, village_id, village_name, district, alert_type, message, timestamp, is_read)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                village_id=excluded.village_id,
                village_name=excluded.village_name,
                district=excluded.district,
                alert_type=excluded.alert_type,
                message=excluded.message,
                timestamp=excluded.timestamp,
                is_read=excluded.is_read
            """,
            (
                alert["id"], alert.get("villageId") or alert.get("village_id"),
                alert.get("villageName") or alert.get("village_name"),
                alert["district"], alert["type"], alert["message"],
                alert.get("time") or alert.get("timestamp"),
                1 if alert.get("read") else 0
            )
        )

    # --- Assessment Logs ---
    def log_assessment(self, village_id: str, risk_score: float, risk_level: str,
                       priority: str, recommended_shelter_id: Optional[str],
                       population: int, capacity: Optional[int], headroom: Optional[int],
                       status: str, payload_dict: Dict[str, Any]) -> int:
        cursor = self.conn.execute(
            """
            INSERT INTO assessment_logs (
                village_id, risk_score, risk_level, priority, recommended_shelter_id,
                affected_population, site_capacity, remaining_headroom, status, assessment_payload_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                village_id, risk_score, risk_level, priority, recommended_shelter_id,
                population, capacity, headroom, status, json.dumps(payload_dict)
            )
        )
        return cursor.lastrowid

    # --- Helpers ---
    def _row_to_village(self, row: sqlite3.Row) -> HabitationEntity:
        return HabitationEntity(
            id=row["id"],
            name=row["name"],
            alias=row["alias"],
            district=row["district"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            population=row["population"],
            elevation_meters=row["elevation_meters"],
            slope_degrees=row["slope_degrees"],
            historical_hazards_count=row["historical_hazards_count"],
            rainfall_mm=row["rainfall_mm"],
            soil_saturation_pct=row["soil_saturation_pct"],
            risk_score=row["risk_score"],
            risk_level=row["risk_level"],
            priority=row["priority"],
            flood_risk=row["flood_risk"],
            landslide_risk=row["landslide_risk"]
        )

    def _row_to_shelter(self, row: sqlite3.Row) -> RelocationSiteEntity:
        return RelocationSiteEntity(
            id=row["id"],
            name=row["name"],
            alias=row["alias"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            total_capacity=row["total_capacity"],
            available_capacity=row["available_capacity"],
            elevation_meters=row["elevation_meters"],
            suitability_score=row["suitability_score"],
            road_access_quality=row["road_access_quality"],
            is_active=bool(row["is_active"])
        )
