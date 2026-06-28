import { Outlet } from 'react-router-dom'
import Sidebar, { MobileHeader } from './Sidebar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <MobileHeader />
      <main className="md:ml-56 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
