import os
from app.core.config import DB_PATH
from app.database.connection import get_raw_connection
from app.database.schema import init_db
from app.database.repository import Repository
from app.services.ingestion_service import IngestionService

def main():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"Removed old database file at {DB_PATH}")

    conn = get_raw_connection()
    try:
        init_db(conn)
        repo = Repository(conn)
        service = IngestionService(repo)
        counts = service.bootstrap_demo_data()
        conn.commit()
        print(f"Successfully bootstrapped Maharashtra dataset:")
        print(f"  - Villages: {counts['villages']}")
        print(f"  - Shelters: {counts['shelters']}")
        print(f"  - Hazards: {counts['hazards']}")
        print(f"  - Alerts: {counts['alerts']}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
