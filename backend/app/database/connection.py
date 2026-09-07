"""Database Connection Manager.

Provides robust SQLite connection management for local prototype persistence.
"""
import sqlite3
import contextlib
from typing import Generator
from app.core.config import settings

def get_raw_connection() -> sqlite3.Connection:
    """Returns a raw sqlite3 connection with Row factory enabled."""
    conn = sqlite3.connect(settings.database_path, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Generator for FastAPI Depends: yields connection with auto-commit/rollback."""
    conn = get_raw_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
