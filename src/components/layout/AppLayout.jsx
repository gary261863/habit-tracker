import { Outlet } from 'react-router-dom'
import Sidebar, { BottomNav } from './Sidebar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <main className="md:ml-56 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
