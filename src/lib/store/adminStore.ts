import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AdminUiState {
  sidebarCollapsed: boolean
  lightMode: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  toggleTheme: () => void
}

export const useAdminUiStore = create<AdminUiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      lightMode: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleTheme: () => set((state) => ({ lightMode: !state.lightMode })),
    }),
    {
      name: "coifly-admin-ui",
    }
  )
)
