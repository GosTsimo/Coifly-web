import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, Scissors, Store, CalendarCheck2, Star, LifeBuoy, Smartphone, ChartNoAxesCombined, Activity, ScrollText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminUiStore } from "@/lib/store/adminStore"

const menu = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/barbers", label: "Barbers", icon: Scissors },
  { to: "/admin/salons", label: "Salons", icon: Store },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck2 },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/tickets", label: "Support Tickets", icon: LifeBuoy },
  { to: "/admin/devices", label: "Devices", icon: Smartphone },
  { to: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { to: "/admin/system", label: "System Status", icon: Activity },
  { to: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
]

interface Props {
  isMobile?: boolean
  open?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ isMobile = false, open = false, onCloseMobile }: Props) {
  const collapsed = useAdminUiStore((s) => s.sidebarCollapsed)

  if (isMobile) {
    return (
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-card/95 shadow-xl backdrop-blur-lg transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b px-4 py-5">
          <p className="text-primary text-xl font-semibold tracking-tight">Coifly</p>
          <p className="text-muted-foreground text-xs">Admin platform</p>
        </div>
        <nav className="space-y-1 px-2 py-4">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    )
  }

  return (
    <aside className={cn("border-r bg-card/70 backdrop-blur-lg transition-all", collapsed ? "w-20" : "w-64")}>
      <div className="border-b px-4 py-5">
        <p className="text-primary text-xl font-semibold tracking-tight">Coifly</p>
        {!collapsed ? <p className="text-muted-foreground text-xs">Admin platform</p> : null}
      </div>
      <nav className="space-y-1 px-2 py-4">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
