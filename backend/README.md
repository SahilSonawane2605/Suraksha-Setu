# SURAKSHA-SETU Backend

**SIH Problem Statement:** SIH26191  
**Theme:** Disaster Management  
**Team:** Team Abhimanyu  
**Backend Team:** Sahil & Swara  

---

## 1. Project Overview

SURAKSHA-SETU is an algorithmic disaster management intelligence and decision-support backend built for rapid flood and landslide mitigation, hazard zone intersection analysis, and capacity-verified evacuation routing.

### Core Processing Pipeline
```
Environmental & Geographic Feeds
              ↓
   Data Ingestion & Normalization
              ↓
           Database
              ↓
      FastAPI Routing Layer
              ↓
       Risk Analysis Engine  ──►  Risk Score (0-100) ──► Risk Level ──► Priority
              ↓
      GIS / Spatial Engine   ──►  Shapely Polygons & Haversine Distance
              ↓
    Relocation Analysis Engine (5-Stage Evaluation)
              ↓
   Carrying Capacity Engine  ──►  Remaining Headroom = Capacity - Affected Population
              ↓
    Final Recommendation     ──►  Structured Evacuation Action Plan
              ↓
     FastAPI REST APIs       ──►  Clean Structured JSON Responses
              ↓
       React Frontend        ──►  Visualizations & Telemetry
```

---

## 2. Technology Stack

- **Python 3.12**: Core programming, business logic, calculations, and analytical processing.
- **FastAPI**: Main web framework, dependency injection, and asynchronous request handling.
- **Shapely 2.1+**: Geographic and spatial geometry operations, Point-in-Polygon risk intersections, and buffer perimeters.
- **GeoJSON**: Standard representation for hazard zones (flood and landslide hazard layers).
- **SQLite**: Zero-overhead local relational database with auto-commit/rollback and WAL journaling.
- **Pandas & NumPy**: Data ingestion, normalization, numeric imputation, and array scaling.
- **Pydantic v2**: Type validation, schema definition, and serialization.
- **Pytest & TestClient**: Automated unit and integration test suite.

---

## 3. Team Responsibilities Division

### Sahil
- Backend architecture and system pipeline design.
- FastAPI core application setup and routing layer (`app/main.py`, `app/api/*`).
- Deterministic Risk Analysis Engine implementation (`app/engines/risk_engine.py`).
- 5-Stage Relocation Decision Engine (`app/engines/relocation_engine.py`).
- End-to-end frontend integration and JSON contract compliance.

### Swara
- Database schema management, SQLite connection pooling, and Repository pattern (`app/database/*`).
- Data validation and Pandas/NumPy ingestion pipeline (`app/services/ingestion_service.py`).
- Carrying Capacity Engine arithmetic and suitability verification (`app/engines/capacity_engine.py`).
- Test suite development, test coverage, and edge-case verification (`tests/*`).
- OpenAPI documentation, error handling, and demo data bootstrapping.

---

## 4. Benchmark Verification Example

As specified in the project requirements:
- **Village A** (`V01` / `Malana Heights`):
  - Population: **3,240**
  - Evaluated Risk Score: **86%**
  - Risk Level: **Critical**
  - Mitigation Priority: **Immediate Action**
- **Shelter B** (`S01` / `Safe Site A - Shanti Camp`):
  - Designated Capacity: **5,000**
  - Headroom Calculation:
    $$\text{Remaining Headroom} = 5,000 - 3,240 = +1,760$$
  - Status: **Suitable**
- **Assessment Endpoint**: `GET /api/v1/villages/village-a/assessment`

---

## 5. API Reference

All endpoints return structured JSON and prefix with `/api/v1`.

### Habitations & Risk Assessment
- `GET /api/v1/villages`: List all monitored habitations with calculated risk scores and priority tiers.
- `GET /api/v1/villages/{village_id}`: Retrieve single habitation details (supports ID `V01` or slug `village-a`).
- `GET /api/v1/villages/{village_id}/assessment`: **Mandatory full assessment endpoint**. Evaluates risk, spatial intersections, 5-stage shelter matching, carrying headroom, and generates a structured evacuation recommendation.

### Relocation Shelters & Carrying Capacity
- `GET /api/v1/shelters`: List candidate relocation shelters with total & available capacities.
- `GET /api/v1/shelters/{shelter_id}`: Retrieve individual shelter specifications.
- `POST /api/v1/shelters/check-capacity`: Perform standalone carrying capacity calculations (`site_capacity - affected_population`).

### GIS Hazard Boundaries
- `GET /api/v1/hazards`: GeoJSON FeatureCollection of flood and landslide polygons.
- `POST /api/v1/hazards/check-intersection`: Test coordinate point-in-polygon against hazard zones.

### Emergency Alerts & Ingestion
- `GET /api/v1/alerts`: Active disaster alert bulletins stream.
- `POST /api/v1/ingest`: Ingest and normalize new raw habitation or shelter feeds.
- `POST /api/v1/ingest/bootstrap`: Reset and re-seed synthetic demo datasets.

---

## 6. Running the Backend

### Prerequisites
- Python 3.12+ installed.
- Dependencies installed:
  ```bash
  pip install -r backend/requirements.txt
  ```

### Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation is available at:
`http://127.0.0.1:8000/docs`

### Run Test Suite
```bash
python -m pytest backend/tests -v
```

---

## 7. Data Notice & Migration Strategy
All synthetic datasets included in this prototype are explicitly marked with `DEMO/MOCK/SAMPLE DATA`. No claims are made that these represent live government data feeds. The ingestion layer is designed for seamless transition to authorized government feeds (NDMA, CWC, IMD) in Stage 4 without modifying the core analytical engines.
