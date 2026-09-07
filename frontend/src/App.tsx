import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MapProvider } from '@/context/MapContext'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import RiskMapPage from '@/pages/RiskMapPage'
import Habitations from '@/pages/Habitations'
import RelocationAnalysis from '@/pages/RelocationAnalysis'
import AlertsNotifications from '@/pages/AlertsNotifications'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <MapProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/risk-map" element={<RiskMapPage />} />
            <Route path="/habitations" element={<Habitations />} />
            <Route path="/relocation" element={<RelocationAnalysis />} />
            <Route path="/alerts" element={<AlertsNotifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MapProvider>
  )
}
