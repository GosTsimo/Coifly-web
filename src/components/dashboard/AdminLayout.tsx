import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"
import { useAdminUiStore } from "@/lib/store/adminStore"

export function AdminLayout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const lightMode = useAdminUiStore((s) => s.lightMode)
  const mobileSidebarOpen = useAdminUiStore((s) => s.mobileSidebarOpen)
  const closeMobileSidebar = useAdminUiStore((s) => s.closeMobileSidebar)

  useEffect(() => {
    document.documentElement.classList.toggle("light", lightMode)
  }, [lightMode])

  useEffect(() => {
    if (isMobile) {
      closeMobileSidebar()
    }
  }, [location.pathname, isMobile, closeMobileSidebar])

  if (location.pathname === "/admin") {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {isMobile ? (
        <div className="min-h-screen">
          <Topbar />
          <main className="from-background via-background to-muted/30 min-h-[calc(100vh-60px)] bg-gradient-to-br p-3 sm:p-4">
            <Outlet />
          </main>
          {mobileSidebarOpen ? (
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-black/45 md:hidden"
              onClick={closeMobileSidebar}
            />
          ) : null}
          <Sidebar isMobile open={mobileSidebarOpen} onCloseMobile={closeMobileSidebar} />
        </div>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="from-background via-background to-muted/30 min-h-[calc(100vh-60px)] bg-gradient-to-br p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      )}
    </div>
  )
}
