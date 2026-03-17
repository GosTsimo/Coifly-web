import { Bell, Menu, Moon, Search, Sun } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAdminUiStore } from "@/lib/store/adminStore"

export function Topbar() {
  const isMobile = useIsMobile()
  const toggleSidebar = useAdminUiStore((s) => s.toggleSidebar)
  const toggleMobileSidebar = useAdminUiStore((s) => s.toggleMobileSidebar)
  const lightMode = useAdminUiStore((s) => s.lightMode)
  const toggleTheme = useAdminUiStore((s) => s.toggleTheme)

  return (
    <header className="border-b bg-card/70 px-4 py-3 backdrop-blur-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex w-full max-w-xl items-center gap-2">
          <Button variant="ghost" size="icon" onClick={isMobile ? toggleMobileSidebar : toggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="relative hidden flex-1 sm:block">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input className="pl-9" placeholder="Search users, salons, bookings..." />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {lightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-lg border px-2 py-1">
            <Avatar className="h-7 w-7">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="hidden text-xs sm:block">
              <p className="font-medium">Admin Ops</p>
              <p className="text-muted-foreground">superadmin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
