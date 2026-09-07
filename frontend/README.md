# SURAKSHA-SETU

**Disaster Management System** — a command-center dashboard for tracking habitation risk,
hazard zones, and relocation readiness across districts.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (dark GIS command-center theme)
- React-Leaflet (interactive risk map, dark CARTO basemap)
- Recharts (risk distribution & analytics charts)
- React Router (client-side navigation across 7 pages)
- Lucide React (icons)

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    layout/       Sidebar, Header, page Layout
    dashboard/     StatCard, RiskDistributionChart, RelocationOverviewCard,
                   PriorityTable, AlertsPanel
    map/           RiskMap (react-leaflet), LayerControl, VillageMarker icons
  context/
    MapContext.tsx Shared state: selected village, fly-to target, layer
                    toggles, and search query — consumed by the header
                    search bar, priority table, alerts panel and map.
  data/            Mock datasets: 138 habitations, 24 alerts, 12 relocation
                    sites, and simplified hazard-zone/river/road geometries.
  pages/           Dashboard, RiskMapPage, Habitations, RelocationAnalysis,
                    AlertsNotifications, Reports, Settings
  types/           Shared TypeScript interfaces
  utils/           Risk color/label helpers, formatting, report aggregation
```

## Notes

- Map markers use custom SVG `DivIcon`s (see `src/components/map/VillageMarker.tsx`)
  instead of Leaflet's default marker images, which avoids the broken-icon-asset
  issue common when bundling `react-leaflet` with Vite.
- Selecting a village from the search bar, priority table, or alerts panel
  updates `MapContext` and flies the map to that location.
- Mock data is generated deterministically in `src/data/*.json`; swap these
  for a live API by replacing the imports in `src/data/*.ts`.
