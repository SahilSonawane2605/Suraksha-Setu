"""Disaster Mitigation Alerts API Routes.

Exposes active emergency alerts compatible with the React frontend alerts stream.

Team: Team Abhimanyu
Backend: Sahil & Swara
"""
from typing import List
from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.database.repository import Repository
from app.models.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Disaster Alerts"])

def get_repository(conn: sqlite3.Connection = Depends(get_db)) -> Repository:
    return Repository(conn)

@router.get(
    "",
    response_model=List[AlertResponse],
    summary="List active alerts",
    description="Returns all active disaster notices and critical bulletins."
)
def get_alerts(repo: Repository = Depends(get_repository)):
    alerts = repo.get_all_alerts()
    return [
        AlertResponse(
            id=a["id"],
            village_id=a["village_id"],
            village_name=a["village_name"],
            district=a["district"],
            type=a["type"],
            message=a["message"],
            timestamp=a["timestamp"],
            read=a["read"]
        )
        for a in alerts
    ]
