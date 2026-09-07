# 🛡️ SURAKSHA-SETU Backend

### Smart Disaster Management & Evacuation Decision-Support System

**SIH Problem Statement:** `SIH26191`
**Theme:** Disaster Management
**Team:** Team Abhimanyu

---

## 📌 Project Overview

**SURAKSHA-SETU** is an algorithmic disaster-management intelligence and decision-support backend designed to support **rapid flood and landslide mitigation, hazard-zone analysis, shelter suitability evaluation, and capacity-verified evacuation planning**.

The backend processes environmental and geographic data, evaluates disaster risk, performs GIS-based hazard intersection analysis, identifies suitable relocation shelters, verifies carrying capacity, and generates structured evacuation recommendations.

### 🎯 Core Objectives

* Calculate deterministic disaster **risk scores from 0–100**
* Classify habitations into appropriate **risk levels and priority tiers**
* Perform **flood and landslide spatial intersection analysis**
* Identify suitable relocation shelters using a **5-stage evaluation process**
* Verify shelter capacity against affected population
* Calculate remaining shelter **headroom**
* Generate structured **evacuation recommendations**
* Provide clean REST APIs for frontend integration
* Maintain a clear migration path from prototype data to authorized real-world data sources

---

## 🏗️ System Architecture

```text
        Environmental & Geographic Feeds
                     │
                     ▼
          Data Ingestion & Normalization
                     │
                     ▼
                  Database
                     │
                     ▼
            FastAPI Routing Layer
                     │
                     ▼
             Risk Analysis Engine
                     │
                     ├──► Risk Score (0–100)
                     ├──► Risk Level
                     └──► Mitigation Priority
                     │
                     ▼
              GIS / Spatial Engine
                     │
                     ├──► Shapely Polygons
                     ├──► Point-in-Polygon
                     └──► Haversine Distance
                     │
                     ▼
        Relocation Analysis Engine
               (5-Stage Evaluation)
                     │
                     ▼
          Carrying Capacity Engine
                     │
                     └──► Remaining Headroom
                          = Capacity − Affected Population
                     │
                     ▼
           Final Recommendation
                     │
                     └──► Structured Evacuation Action Plan
                     │
                     ▼
              FastAPI REST APIs
                     │
                     ▼
             Structured JSON Responses
                     │
                     ▼
              React Frontend
                     │
                     └──► Visualizations & Telemetry
```

---

## ⚙️ Technology Stack

| Technology             | Purpose                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| **Python 3.12**        | Core programming, business logic, calculations and analytical processing |
| **FastAPI**            | REST API framework, routing, dependency injection and request handling   |
| **Shapely 2.1+**       | Spatial geometry and hazard-zone intersection operations                 |
| **GeoJSON**            | Representation of flood and landslide hazard boundaries                  |
| **SQLite**             | Lightweight relational database for prototype deployment                 |
| **Pandas**             | Data ingestion, transformation and normalization                         |
| **NumPy**              | Numerical processing, imputation and array operations                    |
| **Pydantic v2**        | Data validation, schemas and serialization                               |
| **Pytest**             | Automated unit and integration testing                                   |
| **FastAPI TestClient** | API endpoint testing                                                     |

---

# 🧠 Core Processing Engines

## 1. Risk Analysis Engine

The Risk Analysis Engine evaluates habitation-level disaster risk and produces a deterministic risk assessment.

### Output

```text
Risk Score → Risk Level → Mitigation Priority
```

Example:

```text
Risk Score: 86
Risk Level: Critical
Priority: Immediate Action
```

Implementation:

```text
app/engines/risk_engine.py
```

---

## 2. GIS / Spatial Engine

The spatial processing layer analyzes the geographical relationship between habitations and identified hazard zones.

It supports:

* Flood hazard polygons
* Landslide hazard polygons
* Point-in-polygon analysis
* Hazard-zone intersection detection
* Geographic distance calculations
* Buffer/perimeter analysis

Primary technologies:

```text
Shapely
GeoJSON
Haversine Distance
```

---

## 3. Relocation Decision Engine

The Relocation Analysis Engine evaluates potential shelters through a **5-stage decision process**.

```text
Affected Population
       ↓
Risk / Hazard Context
       ↓
Shelter Suitability
       ↓
Geographic Constraints
       ↓
Capacity Verification
       ↓
Final Relocation Recommendation
```

Implementation:

```text
app/engines/relocation_engine.py
```

---

## 4. Carrying Capacity Engine

The Carrying Capacity Engine verifies whether a relocation shelter can accommodate the affected population.

### Formula

```text
Remaining Headroom =
Shelter Capacity − Affected Population
```

### Example

```text
Shelter Capacity       = 5,000
Affected Population    = 3,240

Remaining Headroom
= 5,000 − 3,240
= +1,760
```

A positive headroom indicates that the shelter has sufficient capacity under the evaluated scenario.

Implementation:

```text
app/engines/capacity_engine.py
```

---

# 📊 Benchmark Verification

The backend includes a benchmark scenario for validating the complete risk-to-evacuation pipeline.

## Village A

**ID:** `V01`
**Slug:** `village-a`
**Name:** `Malana Heights`

| Parameter           |                Value |
| ------------------- | -------------------: |
| Population          |                3,240 |
| Risk Score          |              **86%** |
| Risk Level          |         **Critical** |
| Mitigation Priority | **Immediate Action** |

## Shelter B

**ID:** `S01`
**Name:** `Safe Site A - Shanti Camp`

| Parameter           |        Value |
| ------------------- | -----------: |
| Designated Capacity |        5,000 |
| Affected Population |        3,240 |
| Remaining Headroom  |   **+1,760** |
| Status              | **Suitable** |

### Capacity Calculation

```text
Remaining Headroom
= Designated Capacity − Affected Population

= 5,000 − 3,240

= +1,760
```

### Full Assessment Endpoint

```http
GET /api/v1/villages/village-a/assessment
```

This endpoint performs the complete assessment pipeline, including:

```text
Risk Evaluation
      ↓
Spatial Hazard Analysis
      ↓
Shelter Matching
      ↓
5-Stage Relocation Evaluation
      ↓
Capacity Verification
      ↓
Evacuation Recommendation
```

---

# 🔌 API Reference

All APIs use the following base prefix:

```text
/api/v1
```

All endpoints return structured JSON responses.

---

## 🏘️ Habitations & Risk Assessment

### `GET /api/v1/villages`

List all monitored habitations with calculated risk scores and priority tiers.

### `GET /api/v1/villages/{village_id}`

Retrieve details of a specific habitation.

Supports:

```text
V01
```

or:

```text
village-a
```

### `GET /api/v1/villages/{village_id}/assessment`

**Mandatory full assessment endpoint.**

Evaluates:

* Disaster risk
* Hazard intersections
* Spatial conditions
* Shelter suitability
* 5-stage relocation logic
* Carrying capacity
* Evacuation recommendation

---

## 🏕️ Relocation Shelters & Capacity

### `GET /api/v1/shelters`

List candidate relocation shelters with total and available capacities.

### `GET /api/v1/shelters/{shelter_id}`

Retrieve individual shelter specifications.

### `POST /api/v1/shelters/check-capacity`

Perform standalone carrying-capacity calculations.

```text
site_capacity − affected_population
```

---

## 🗺️ GIS Hazard Boundaries

### `GET /api/v1/hazards`

Returns a GeoJSON `FeatureCollection` containing flood and landslide hazard polygons.

### `POST /api/v1/hazards/check-intersection`

Tests whether a coordinate falls within or intersects a defined hazard zone.

---

## 🚨 Emergency Alerts & Data Ingestion

### `GET /api/v1/alerts`

Returns active disaster alert bulletins.

### `POST /api/v1/ingest`

Ingests and normalizes new raw habitation or shelter feeds.

### `POST /api/v1/ingest/bootstrap`

Resets and re-seeds synthetic demonstration datasets.

---

# 📁 Project Structure

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── ...
│   │
│   ├── database/
│   │   └── ...
│   │
│   ├── engines/
│   │   ├── risk_engine.py
│   │   ├── relocation_engine.py
│   │   └── capacity_engine.py
│   │
│   ├── services/
│   │   └── ingestion_service.py
│   │
│   └── ...
│
├── tests/
│   └── ...
│
├── requirements.txt
└── ...
```

---

# 🚀 How to Run

Follow these steps to run the SURAKSHA-SETU backend locally.

## 1. Prerequisites

Make sure you have:

* **Python 3.12+**
* **pip**
* **Git**

Verify Python installation:

```bash
python --version
```

Expected:

```text
Python 3.12.x
```

---

## 2. Clone the Repository

Clone the project repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd <PROJECT_FOLDER>
```

---

## 3. Navigate to the Backend

```bash
cd backend
```

---

## 4. Create a Virtual Environment

It is recommended to use a virtual environment.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

After activation, your terminal should show something similar to:

```text
(venv)
```

---

## 5. Install Dependencies

Install all required Python packages:

```bash
pip install -r requirements.txt
```

---

## 6. Start the Backend Server

Run:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

If the server starts successfully, you should see output similar to:

```text
Uvicorn running on http://0.0.0.0:8000
```

The backend is now running at:

```text
http://127.0.0.1:8000
```

---

## 7. Open API Documentation

Open the following URL in your browser:

**Swagger UI**

```text
http://127.0.0.1:8000/docs
```

Swagger allows you to interactively test the available APIs.

You can also access:

**ReDoc**

```text
http://127.0.0.1:8000/redoc
```

---

## 8. Bootstrap Demo Data

If the application requires the synthetic demonstration dataset to be initialized, use:

```http
POST /api/v1/ingest/bootstrap
```

You can execute this endpoint directly through the Swagger UI.

This initializes/resets the prototype habitation, shelter and related demonstration data.

---

## 9. Test the Assessment API

Once the backend is running and demo data has been initialized, test:

```http
GET /api/v1/villages/village-a/assessment
```

The endpoint should return the structured assessment containing information such as:

```text
Risk Score
Risk Level
Priority
Hazard Information
Shelter Evaluation
Capacity
Remaining Headroom
Relocation Recommendation
```

---

# 🧪 Running Tests

From the project root, run:

```bash
python -m pytest backend/tests -v
```

Or, if you are already inside the `backend` directory:

```bash
python -m pytest tests -v
```

The test suite covers:

* Risk calculation
* Relocation logic
* Capacity calculations
* GIS intersection logic
* API responses
* Data validation
* Edge cases
* Backend workflows

---

# 🔄 Data Notice & Migration Strategy

All synthetic datasets included in this prototype are explicitly marked as:

```text
DEMO / MOCK / SAMPLE DATA
```

These datasets **do not represent live government data feeds**.

The ingestion layer is designed to support future integration with authorized disaster-management data sources such as:

```text
NDMA
CWC
IMD
```

The core analytical engines can remain unchanged while the ingestion layer evolves from synthetic prototype data to authorized external feeds.

```text
Current Prototype

Synthetic Data
      ↓
Ingestion & Normalization
      ↓
Core Analytical Engines
      ↓
FastAPI
      ↓
React Frontend
```

```text
Future Deployment

Authorized Government Feeds
      ↓
Ingestion & Normalization
      ↓
Core Analytical Engines
      ↓
FastAPI
      ↓
React Frontend
```

---

# 🛡️ Design Principles

### Deterministic Decision Support

Risk and capacity calculations are based on defined algorithms and rules.

### Spatial Awareness

GIS-based analysis incorporates geographical hazard boundaries into disaster assessment.

### Capacity Verification

Shelter recommendations account for available capacity and affected population.

### Modular Architecture

Risk analysis, relocation, capacity, ingestion, database and API components are separated for maintainability and extensibility.

### Frontend-Agnostic APIs

The backend exposes structured JSON APIs that can be consumed independently by the React frontend or other clients.

---

# 🔮 Future Scope

The architecture can be extended with:

* Real-time government disaster feeds
* Real-time weather and rainfall data
* Live flood-level monitoring
* IoT sensor integration
* Satellite and remote-sensing data
* Advanced GIS analysis
* Historical disaster-data analysis
* Machine-learning-based risk prediction
* Multi-shelter evacuation optimization
* Real-time emergency-service integration
* Automated disaster-alert generation
* Production-grade PostgreSQL/PostGIS deployment

---

# 🌐 Project

**SURAKSHA-SETU**
*Algorithmic Intelligence for Disaster Risk Assessment and Evacuation Decision Support*

**SIH Problem Statement:** `SIH26191`
**Theme:** `Disaster Management`
**Team:** `Team Abhimanyu`
