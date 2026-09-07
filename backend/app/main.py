"""SURAKSHA-SETU Disaster Management Intelligence Backend.

SIH Problem Statement: SIH26191
Theme: Disaster Management
Team: Team Abhimanyu
Backend Team: Sahil & Swara
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.constants import (
    PROJECT_NAME,
    PROJECT_CODE,
    PROJECT_THEME,
    PROJECT_TEAM,
    BACKEND_TEAM,
    DATA_SOURCE_TAG,
    DATA_SOURCE_DISCLAIMER,
)
from app.database.connection import get_raw_connection
from app.database.schema import init_db
from app.database.repository import Repository
from app.services.ingestion_service import IngestionService

from app.api.routes_villages import router as villages_router
from app.api.routes_shelters import router as shelters_router
from app.api.routes_hazards import router as hazards_router
from app.api.routes_alerts import router as alerts_router
from app.api.routes_ingestion import router as ingestion_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("suraksha_setu")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle startup: initializes SQLite schema and bootstraps demo datasets if empty."""
    logger.info(f"Starting {PROJECT_NAME} Backend ({PROJECT_CODE})...")
    conn = get_raw_connection()
    try:
        init_db(conn)
        repo = Repository(conn)
        existing_villages = repo.get_all_villages()
        if not existing_villages:
            logger.info("Database empty on startup. Bootstrapping synthetic mock data...")
            service = IngestionService(repo)
            service.bootstrap_demo_data()
            conn.commit()
    finally:
        conn.close()
    yield
    logger.info(f"Shutting down {PROJECT_NAME} Backend.")

# Initialize FastAPI Application
app = FastAPI(
    title=f"{PROJECT_NAME} Disaster Intelligence Platform",
    description=(
        f"Backend processing and decision support layer for SIH Problem Statement {PROJECT_CODE} "
        f"({PROJECT_THEME}). Developed by {PROJECT_TEAM} (Backend: {BACKEND_TEAM}).\n\n"
        f"**Data Notice**: Currently running with {DATA_SOURCE_TAG}. {DATA_SOURCE_DISCLAIMER}"
    ),
    version=settings.version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for React Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Error Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "code": 422,
            "data_notice": DATA_SOURCE_TAG,
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "code": 500,
            "data_notice": DATA_SOURCE_TAG,
        }
    )

# Root & Health Endpoints
@app.get("/", tags=["System"])
def root():
    return {
        "project": PROJECT_NAME,
        "sih_statement": PROJECT_CODE,
        "theme": PROJECT_THEME,
        "team": PROJECT_TEAM,
        "backend_team": BACKEND_TEAM,
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "api_v1_prefix": settings.api_v1_prefix,
        "data_mode": DATA_SOURCE_TAG,
        "disclaimer": DATA_SOURCE_DISCLAIMER,
    }

@app.get("/health", tags=["System"])
def health():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "data_mode": DATA_SOURCE_TAG,
    }

# Register API v1 Routers
app.include_router(villages_router, prefix=settings.api_v1_prefix)
app.include_router(shelters_router, prefix=settings.api_v1_prefix)
app.include_router(hazards_router, prefix=settings.api_v1_prefix)
app.include_router(alerts_router, prefix=settings.api_v1_prefix)
app.include_router(ingestion_router, prefix=settings.api_v1_prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
