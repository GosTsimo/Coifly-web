import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/adminApi"
import type {
  AccountStatus,
  BookingStatus,
  ModerationStatus,
  ServiceStatus,
  TicketStatus,
  Urgency,
  UserRole,
} from "@/lib/types/admin"

export const adminKeys = {
  kpis: (days: number) => ["admin", "kpis", days] as const,
  trends: (days: number) => ["admin", "trends", days] as const,
  users: (params: Record<string, unknown>) => ["admin", "users", params] as const,
  barbers: (page: number, perPage: number) => ["admin", "barbers", page, perPage] as const,
  salons: (page: number, perPage: number) => ["admin", "salons", page, perPage] as const,
  bookings: (params: Record<string, unknown>) => ["admin", "bookings", params] as const,
  reviews: (type: string, includeHidden: boolean) => ["admin", "reviews", type, includeHidden] as const,
  devices: (params: Record<string, unknown>) => ["admin", "devices", params] as const,
  tickets: (params: Record<string, unknown>) => ["admin", "tickets", params] as const,
  system: ["admin", "system"] as const,
  audit: (page: number, perPage: number) => ["admin", "audit", page, perPage] as const,
}

export function useDashboardKpis(days = 30) {
  return useQuery({
    queryKey: adminKeys.kpis(days),
    queryFn: async () => (await adminApi.getDashboardKpis(days)).data,
  })
}

export function useDashboardTrends(days = 30) {
  return useQuery({
    queryKey: adminKeys.trends(days),
    queryFn: async () => (await adminApi.getTrends(days)).data,
  })
}

export function useUsers(params: { search?: string; role?: string; status?: string; per_page?: number; page?: number }) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: async () => {
      const response = await adminApi.getUsers(params)
      console.log("[Users] Raw API response /admin/users:", response)
      console.log("[Users] First row sample:", response.data?.data?.[0] ?? null)
      return response.data
    },
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: number; status: AccountStatus; reason?: string }) =>
      adminApi.updateUserStatus(payload.userId, { status: payload.status, reason: payload.reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  })
}

export function useAssignUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: number; role: UserRole; replace?: boolean }) =>
      adminApi.assignUserRole(payload.userId, { role: payload.role, replace: payload.replace }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  })
}

export function useBarbers(page = 1, perPage = 10) {
  return useQuery({
    queryKey: adminKeys.barbers(page, perPage),
    queryFn: async () => {
      const response = await adminApi.getBarbers(page, perPage)
      console.log("[Barbers] Raw API response /admin/barbers:", response)
      console.log("[Barbers] First row sample:", response.data?.data?.[0] ?? null)
      return response.data
    },
  })
}

export function useModerateBarber() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { barberId: number; status: ModerationStatus; reason?: string }) =>
      adminApi.moderateBarber(payload.barberId, { status: payload.status, reason: payload.reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "barbers"] }),
  })
}

export function useSalons(page = 1, perPage = 10) {
  return useQuery({
    queryKey: adminKeys.salons(page, perPage),
    queryFn: async () => {
      const response = await adminApi.getSalons(page, perPage)
      console.log("[Salons] Raw API response /admin/salons:", response)
      console.log("[Salons] First row sample:", response.data?.data?.[0] ?? null)
      return response.data
    },
  })
}

export function useModerateSalon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { salonId: number; status: ModerationStatus; reason?: string }) => {
      const requestBody = { status: payload.status, reason: payload.reason }
      console.log("[Salons] Moderation payload:", {
        salonId: payload.salonId,
        endpoint: `/api/admin/salons/${payload.salonId}/moderation`,
        method: "PUT",
        body: requestBody,
      })
      return adminApi.moderateSalon(payload.salonId, requestBody)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("[Salons] Moderation error message:", message)
      console.error("[Salons] Moderation error object:", error)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "salons"] }),
  })
}

export function useBookings(params: {
  status?: string
  salon_id?: string
  from?: string
  to?: string
  per_page?: number
  page?: number
}) {
  return useQuery({
    queryKey: adminKeys.bookings(params),
    queryFn: async () => (await adminApi.getBookings(params)).data,
  })
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { bookingId: number; status: BookingStatus; reason?: string }) =>
      adminApi.updateBookingStatus(String(payload.bookingId), { status: payload.status, reason: payload.reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] }),
  })
}

export function useReviews(type: "all" | "salon" | "barber", includeHidden: boolean) {
  return useQuery({
    queryKey: adminKeys.reviews(type, includeHidden),
    queryFn: async () => (await adminApi.getReviews({ type, include_hidden: includeHidden })).data,
  })
}

export function useModerateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { type: "salon" | "barber"; reviewId: number; action: "hide" | "unhide" | "delete"; reason?: string }) =>
      adminApi.moderateReview(payload.type, payload.reviewId, { action: payload.action, reason: payload.reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  })
}

export function useDevices(params: { active?: boolean; per_page?: number; page?: number }) {
  return useQuery({
    queryKey: adminKeys.devices(params),
    queryFn: async () => (await adminApi.getDevices(params)).data,
  })
}

export function useDeleteInvalidTokens() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => adminApi.deleteInvalidTokens(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "devices"] }),
  })
}

export function useTickets(params: { status?: TicketStatus; urgency?: Urgency; escalated?: boolean; per_page?: number; page?: number }) {
  return useQuery({
    queryKey: adminKeys.tickets(params),
    queryFn: async () => (await adminApi.getTickets(params)).data,
  })
}

export function useAssignTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { ticketId: number; admin_user_id: number }) => adminApi.assignTicket(payload.ticketId, payload.admin_user_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  })
}

export function useReplyTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { ticketId: number; message: string }) => adminApi.replyTicket(payload.ticketId, payload.message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  })
}

export function useEscalateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: number) => adminApi.escalateTicket(ticketId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  })
}

export function useCloseTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: number) => adminApi.closeTicket(ticketId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] }),
  })
}

export function useSystemStatus() {
  return useQuery({
    queryKey: adminKeys.system,
    queryFn: async () => (await adminApi.getSystemStatus()).data,
  })
}

export function useUpdateSystemService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { serviceKey: string; status: ServiceStatus; is_active?: boolean }) =>
      adminApi.updateSystemService(payload.serviceKey, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "system"] }),
  })
}

export function useCreateSystemService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      service_key: string
      service_name: string
      status: ServiceStatus
      is_active: boolean
      sort_order?: number
    }) => adminApi.createSystemService(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "system"] }),
  })
}

export function useAuditLogs(page = 1, perPage = 10) {
  return useQuery({
    queryKey: adminKeys.audit(page, perPage),
    queryFn: async () => {
      try {
        const response = await adminApi.getAuditLogs(page, perPage)
        return response.data
      } catch (error) {
        console.error("[Audit] Query error object:", error)
        console.error("[Audit] Query error message:", error instanceof Error ? error.message : "Unknown error")
        throw error
      }
    },
  })
}
