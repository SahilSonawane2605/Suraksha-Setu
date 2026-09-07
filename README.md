# SURAKSHA-SETU: Disaster Management Intelligence Platform (Integrated)

**SURAKSHA-SETU** is an integrated AI & GIS decision-support intelligence platform for disaster mitigation, risk assessment, and emergency relocation planning.

---

## 📁 Repository Structure

```
D:\HG\suraksha-setu-integrated\
├── frontend\                  # React (TypeScript) + Vite + Tailwind CSS + Leaflet GIS
│   ├── src\
│   │   ├── api\client.ts      # REST API Client layer (FastAPI integration)
│   │   ├── components\        # Dashboard, Layout, GIS Map & AddVillageModal components
│   │   ├── context\           # Map & Live Data Provider (MapContext)
│   │   ├── pages\             # Command Center Dashboard, Habitations, Risk Map, Relocation Analysis
│   │   └── utils\             # Risk scoring & formatted metrics
│   ├── package.json
│   └── vite.config.ts
├── backend\                   # FastAPI (Python 3.12) REST Service + SQLite
│   ├── app\
│   │   ├── api\               # REST API Routes (Villages, Shelters, Hazards, Alerts, Ingestion)
│   │   ├── engines\           # Risk, Spatial/GIS, Capacity, Relocation & Recommendation engines
│   │   ├── database\          # SQLite Connection, Repository, Schema & Persistence
│   │   ├── models\            # Domain Entities & Pydantic JSON Schemas
│   │   └── main.py            # FastAPI Application Entry Point
│   ├── data_store\
│   │   └── suraksha_setu.db   # SQLite Database (Single Source of Truth)
│   ├── requirements.txt
│   └── tests\                 # Pytest Integration Test Suite
└── README.md                  # System Documentation
```

---

## ⚡ Quick Start Instructions

### 1. Launch Backend Service
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Base URL**: `http://localhost:8000/api/v1`
- **Swagger Interactive Docs**: `http://localhost:8000/docs`

### 2. Launch Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- **Application Dashboard**: `http://localhost:5173`

---

## 🔬 Core System Features & Decision Pipeline

### 1. Habitation Risk Assessment Engine
- Evaluates elevation, slope angle, 24h rainfall intensity, soil saturation, and historical hazard frequency.
- Produces normalized Risk Scores (0-100), Risk Levels (`Critical`, `High`, `Moderate`, `Low`, `Safe`), and Action Priorities (`Immediate Action`, `High Priority`, `Proactive Monitoring`).

### 2. GIS Hazard & Spatial Intersection
- Standard GeoJSON hazard polygon overlays for flood zones, landslide failure planes, rivers, and access routes.
- Spatial point-in-polygon intersection test to classify threatened habitations.

### 3. Relocation & Carrying Capacity Engine
- Evaluates candidate shelters based on distance, road access quality, elevation, and suitability score.
- Computes Carrying-Capacity Headroom:
  $$\text{Remaining Headroom} = \text{Site Capacity} - \text{Affected Evacuee Population}$$
- Classifies candidate status as `SUITABLE` ($\text{Headroom} \ge 0$) or `OVERCAPACITY` ($\text{Headroom} < 0$).

### 4. Direct Village Addition Workflow
- Manually register new habitations through the frontend form (`AddVillageModal`).
- Submits `POST /api/v1/villages` to FastAPI backend.
- Computes risk parameters on ingestion, persists record into `data_store/suraksha_setu.db`, and updates the live Dashboard and Map state instantly.

---

## 🧪 Testing

### Backend Unit & Integration Tests
```bash
cd backend
pytest -v
```

### Frontend Typechecking & Production Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```
