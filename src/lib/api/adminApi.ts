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
  const token = getToken()
  
  // Log the request for debugging
  console.debug(`[API] ${options.method || 'GET'} ${API_BASE}${path}`, {
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 20) + '...' : 'none',
  })

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers ?? {}) },
    })

    // Log response status
    console.debug(`[API] Response: ${res.status} ${res.statusText}`)

    // Handle 401 Unauthenticated
    if (res.status === 401) {
      console.warn('[API] Received 401 - clearing auth and redirecting')
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
      console.error(`[API] Error: ${errorMsg}`, errorData)
      throw new Error(errorMsg)
    }

    const json = await res.json()
    console.debug(`[API] Success`, { success: json.success })
    return json as ApiEnvelope<T>
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[API] Exception on ${path}:`, message, error)
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
    return apiFetch<Salon>(`/admin/salons/${salonId}/moderate`, {
      method: "PATCH",
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
      const response = await apiFetch<DashboardKpis>(`/admin/kpis${query}`)
      console.log("[AdminAPI] KPI primary route /admin/kpis response:", response)
      if (response?.data) {
        console.log("[AdminAPI] KPI primary route data keys:", Object.keys(response.data))
      }
      return response
    } catch (error) {
      const msg = error instanceof Error ? error.message : ""
      if (msg.toLowerCase().includes("could not be found") || msg.includes("404")) {
        const fallbackResponse = await apiFetch<DashboardKpis>(`/admin/dashboard/kpis${query}`)
        console.log("[AdminAPI] KPI fallback route /admin/dashboard/kpis response:", fallbackResponse)
        if (fallbackResponse?.data) {
          console.log("[AdminAPI] KPI fallback route data keys:", Object.keys(fallbackResponse.data))
        }
        return fallbackResponse
      }
      throw error
    }
  },

  async getTrends(days = 30): Promise<ApiEnvelope<TrendPoint[]>> {
    const response = await apiFetch<TrendPoint[]>(`/admin/dashboard/trends${buildQuery({ days })}`)
    console.log("[AdminAPI] Trends route /admin/dashboard/trends response:", response)
    return response
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
    return apiFetch<{ deleted_count: number }>(`/admin/devices/cleanup`, {
      method: "DELETE",
    })
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

  async getAuditLogs(page = 1, per_page = 10) {
    return apiFetch<PaginatedResponse<AuditLog>>(`/admin/audit-logs${buildQuery({ page, per_page })}`)
  },
}
