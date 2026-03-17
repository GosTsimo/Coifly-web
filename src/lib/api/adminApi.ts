import type {
  AccountStatus,
  ApiEnvelope,
  AuditLog,
  BarberReview,
  Barber,
  Booking,
  BookingStatus,
  DashboardKpis,
  Device,
  ModerationStatus,
  PaginatedResponse,
  Role,
  Salon,
  SalonReview,
  ServiceStatus,
  SystemService,
  Ticket,
  TrendPoint,
  Urgency,
  User,
  UserActivity,
  UserRole,
} from "@/lib/types/admin"

const API_BASE = "https://beautybooking-f05a760bafaf.herokuapp.com/api"
const TOKEN_KEY = "coifly_token"

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers ?? {}) },
    })

    // Handle 401 Unauthenticated
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('coifly_user')
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      throw new Error('Unauthenticated - token invalid or expired')
    }

    // Handle other HTTP errors
    if (!res.ok) {
      let errorData: any
      try {
        errorData = await res.json()
      } catch {
        errorData = { message: `HTTP ${res.status}: ${res.statusText}` }
      }
      
      const errorMsg = errorData?.message || `HTTP ${res.status}: ${res.statusText}`
      throw new Error(errorMsg)
    }

    const json = await res.json()
    return json as ApiEnvelope<T>
  } catch (error) {
    throw error
  }
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&")
  return qs ? `?${qs}` : ""
}

export const adminApi = {
  async getUsers(params: { search?: string; role?: string; status?: string; per_page?: number; page?: number }) {
    return apiFetch<PaginatedResponse<User>>(`/admin/users${buildQuery(params)}`)
  },

  async updateUserStatus(userId: number, payload: { status: AccountStatus; reason?: string }) {
    return apiFetch<Record<string, unknown>>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async assignUserRole(userId: number, payload: { role: UserRole; replace?: boolean }) {
    return apiFetch<{ user_id: number; roles: Role[] }>(`/admin/users/${userId}/role`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async getUserActivity(userId: number) {
    return apiFetch<UserActivity>(`/admin/users/${userId}/activity`)
  },

  async getBarbers(page = 1, per_page = 10) {
    return apiFetch<PaginatedResponse<Barber>>(`/admin/barbers${buildQuery({ page, per_page })}`)
  },

  async moderateBarber(barberId: number, payload: { status: ModerationStatus; reason?: string }) {
    return apiFetch<Barber>(`/admin/barbers/${barberId}/moderate`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async getSalons(page = 1, per_page = 10) {
    return apiFetch<PaginatedResponse<Salon>>(`/admin/salons${buildQuery({ page, per_page })}`)
  },

  async moderateSalon(salonId: number, payload: { status: ModerationStatus; reason?: string }) {
    return apiFetch<Salon>(`/admin/salons/${salonId}/moderation`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  async getBookings(params: {
    status?: string
    salon_id?: string
    from?: string
    to?: string
    per_page?: number
    page?: number
  }) {
    return apiFetch<PaginatedResponse<Booking>>(`/admin/bookings${buildQuery(params)}`)
  },

  async updateBookingStatus(bookingId: string, payload: { status: BookingStatus; reason?: string }) {
    return apiFetch<Booking>(`/admin/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async getDashboardKpis(days = 30) {
    const query = buildQuery({ days })
    try {
      return await apiFetch<DashboardKpis>(`/admin/kpis${query}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : ""
      if (msg.toLowerCase().includes("could not be found") || msg.includes("404")) {
        return await apiFetch<DashboardKpis>(`/admin/dashboard/kpis${query}`)
      }
      throw error
    }
  },

  async getTrends(days = 30): Promise<ApiEnvelope<TrendPoint[]>> {
    const path = `/admin/dashboard/trends${buildQuery({ days })}`
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: authHeaders(),
    })

    const raw = await res.text()

    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem("coifly_user")
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
      throw new Error("Unauthenticated - token invalid or expired")
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    const parsed = JSON.parse(raw) as ApiEnvelope<TrendPoint[]>
    return parsed
  },

  async getReviews(params: { type?: "all" | "salon" | "barber"; include_hidden?: boolean }) {
    return apiFetch<{ salon_reviews: SalonReview[]; barber_reviews: BarberReview[] }>(
      `/admin/reviews${buildQuery(params)}`
    )
  },

  async moderateReview(
    type: "salon" | "barber",
    reviewId: number,
    payload: { action: "hide" | "unhide" | "delete"; reason?: string }
  ) {
    return apiFetch<null>(`/admin/reviews/${type}/${reviewId}/moderation`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async getDevices(params: { active?: boolean; per_page?: number; page?: number }) {
    return apiFetch<PaginatedResponse<Device>>(`/admin/devices${buildQuery(params)}`)
  },

  async deleteInvalidTokens() {
    const path = `/admin/devices/cleanup`
    const url = `${API_BASE}${path}`

    console.log("[Devices] Cleanup request:", { url, method: "DELETE" })

    const res = await fetch(url, {
      method: "DELETE",
      headers: authHeaders(),
    })

    const raw = await res.text()
    console.log("[Devices] Cleanup response status:", { status: res.status, statusText: res.statusText })
    console.log("[Devices] Cleanup raw response text:", raw)

    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem("coifly_user")
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
      throw new Error("Unauthenticated - token invalid or expired")
    }

    if (!res.ok) {
      throw new Error(`Devices cleanup failed: HTTP ${res.status} ${res.statusText} - ${raw}`)
    }

    try {
      const parsed = JSON.parse(raw) as ApiEnvelope<{ deleted_count: number }>
      console.log("[Devices] Cleanup parsed response:", parsed)
      return parsed
    } catch (error) {
      console.error("[Devices] Cleanup JSON parse error:", error)
      throw new Error(`Devices cleanup parse error: ${raw}`)
    }
  },

  async getTickets(params: {
    status?: Ticket["status"]
    urgency?: Urgency
    escalated?: boolean
    per_page?: number
    page?: number
  }) {
    return apiFetch<PaginatedResponse<Ticket>>(`/admin/tickets${buildQuery(params)}`)
  },

  async assignTicket(ticketId: number, admin_user_id: number) {
    return apiFetch<Ticket>(`/admin/tickets/${ticketId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ admin_user_id }),
    })
  },

  async replyTicket(ticketId: number, message: string) {
    return apiFetch<null>(`/admin/tickets/${ticketId}/reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    })
  },

  async escalateTicket(ticketId: number) {
    return apiFetch<Ticket>(`/admin/tickets/${ticketId}/escalate`, {
      method: "PATCH",
    })
  },

  async closeTicket(ticketId: number) {
    return apiFetch<Ticket>(`/admin/tickets/${ticketId}/close`, {
      method: "PATCH",
    })
  },

  async getSystemStatus() {
    return apiFetch<SystemService[]>(`/admin/system/statuses`)
  },

  async updateSystemService(serviceKey: string, payload: { status: ServiceStatus; is_active?: boolean }) {
    return apiFetch<SystemService>(`/admin/system/statuses/${encodeURIComponent(serviceKey)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async createSystemService(payload: {
    service_key: string
    service_name: string
    status: ServiceStatus
    is_active: boolean
    sort_order?: number
  }) {
    return apiFetch<SystemService>(`/admin/system/statuses`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async getAuditLogs(page = 1, per_page = 10) {
    const path = `/admin/audit-logs${buildQuery({ page, per_page })}`
    const url = `${API_BASE}${path}`

    console.log("[Audit] Request:", { url, method: "GET", params: { page, per_page } })

    const res = await fetch(url, {
      method: "GET",
      headers: authHeaders(),
    })

    const raw = await res.text()
    console.log("[Audit] Response status:", { status: res.status, statusText: res.statusText })
    console.log("[Audit] Raw response text:", raw)

    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem("coifly_user")
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
      throw new Error("Unauthenticated - token invalid or expired")
    }

    if (!res.ok) {
      throw new Error(`Audit logs request failed: HTTP ${res.status} ${res.statusText} - ${raw}`)
    }

    try {
      const parsed = JSON.parse(raw) as ApiEnvelope<PaginatedResponse<AuditLog>>
      console.log("[Audit] Parsed response:", parsed)
      return parsed
    } catch (error) {
      console.error("[Audit] JSON parse error:", error)
      throw new Error(`Audit logs parse error: ${raw}`)
    }
  },
}
