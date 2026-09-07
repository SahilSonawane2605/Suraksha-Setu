"""Application Configuration Module.

Maintains settings, database path, API prefix, and CORS settings.
"""
import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_DIR = BASE_DIR / "data_store"
DB_PATH = DB_DIR / "suraksha_setu.db"

class Settings(BaseModel):
    app_name: str = "SURAKSHA-SETU Disaster Management Intelligence Backend"
    version: str = "1.0.0"
    api_v1_prefix: str = "/api/v1"
    database_url: str = f"sqlite:///{DB_PATH.as_posix()}"
    database_path: str = str(DB_PATH)
    debug: bool = True
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

settings = Settings()

# Ensure database directory exists
os.makedirs(DB_DIR, exist_ok=True)
