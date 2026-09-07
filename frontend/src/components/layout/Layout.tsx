import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import AddVillageModal from '@/components/dashboard/AddVillageModal'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <AddVillageModal />
    </div>
  )
}
