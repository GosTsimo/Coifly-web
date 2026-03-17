import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"
import { useAdminUiStore } from "@/lib/store/adminStore"

export function AdminLayout() {
  const location = useLocation()
  const lightMode = useAdminUiStore((s) => s.lightMode)

  useEffect(() => {
    document.documentElement.classList.toggle("light", lightMode)
  }, [lightMode])

  if (location.pathname === "/admin") {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="from-background via-background to-muted/30 min-h-[calc(100vh-60px)] bg-gradient-to-br p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
