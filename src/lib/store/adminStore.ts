import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AdminUiState {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  lightMode: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  closeMobileSidebar: () => void
  toggleMobileSidebar: () => void
  toggleSidebar: () => void
  toggleTheme: () => void
}

export const useAdminUiStore = create<AdminUiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      lightMode: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleTheme: () => set((state) => ({ lightMode: !state.lightMode })),
    }),
    {
      name: "coifly-admin-ui",
    }
  )
)
