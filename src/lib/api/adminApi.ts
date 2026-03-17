import {
  auditLogs,
  barbers,
  bookings,
  dashboardKpis,
  devices,
  reviews,
  salons,
  systemServices,
  tickets,
  trends,
  users,
} from "@/lib/api/adminMockData"
import type {
  AccountStatus,
  ApiEnvelope,
  AuditLog,
  Barber,
  Booking,
  BookingStatus,
  DashboardKpis,
  Device,
  ModerationStatus,
  PaginatedResponse,
  Review,
  Salon,
  ServiceStatus,
  SystemService,
  Ticket,
  TrendPoint,
  Urgency,
  User,
  UserActivity,
  UserRole,
} from "@/lib/types/admin"

function sleep(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function paginate<T>(items: T[], page = 1, perPage = 10): PaginatedResponse<T> {
  const total = items.length
  const safePerPage = Math.max(1, Math.min(100, perPage))
  const lastPage = Math.max(1, Math.ceil(total / safePerPage))
  const safePage = Math.min(Math.max(page, 1), lastPage)
  const start = (safePage - 1) * safePerPage
  return {
    current_page: safePage,
    data: items.slice(start, start + safePerPage),
    last_page: lastPage,
    per_page: safePerPage,
    total,
  }
}

export const adminApi = {
  async getUsers(params: { search?: string; role?: string; status?: string; per_page?: number; page?: number }) {
    await sleep()
    let list = [...users]
    if (params.search) {
      const q = params.search.toLowerCase()
      list = list.filter((u) => [u.name, u.email, u.phone].join(" ").toLowerCase().includes(q))
    }
    if (params.role) {
      list = list.filter((u) => u.roles.includes(params.role as UserRole))
    }
    if (params.status) {
      list = list.filter((u) => u.account_status === params.status)
    }
    return { success: true, data: paginate(list, params.page, params.per_page) } as ApiEnvelope<PaginatedResponse<User>>
  },

  async updateUserStatus(userId: number, payload: { status: AccountStatus; reason?: string }) {
    await sleep(250)
    const user = users.find((u) => u.id === userId)
    if (!user) return { success: false, message: "User not found" } as ApiEnvelope<never>
    user.account_status = payload.status
    return {
      success: true,
      data: {
        id: user.id,
        account_status: user.account_status,
        status_note: payload.reason,
        suspended_at: payload.status === "suspended" ? new Date().toISOString() : null,
        banned_at: payload.status === "banned" ? new Date().toISOString() : null,
      },
    } as ApiEnvelope<Record<string, unknown>>
  },

  async assignUserRole(userId: number, payload: { role: UserRole; replace?: boolean }) {
    await sleep(250)
    const user = users.find((u) => u.id === userId)
    if (!user) return { success: false, message: "User not found" } as ApiEnvelope<never>
    user.roles = payload.replace ? [payload.role] : Array.from(new Set([...user.roles, payload.role]))
    return { success: true, data: { user_id: user.id, roles: user.roles } } as ApiEnvelope<{ user_id: number; roles: UserRole[] }>
  },

  async getUserActivity(userId: number) {
    await sleep(350)
    const user = users.find((u) => u.id === userId)
    if (!user) return { success: false, message: "User not found" } as ApiEnvelope<never>
    const activity: UserActivity = {
      user: { id: user.id, name: user.name, email: user.email },
      stats: {
        bookings_count: Math.floor(Math.random() * 30),
        reviews_count: Math.floor(Math.random() * 10),
        tickets_count: Math.floor(Math.random() * 5),
        devices_count: Math.floor(Math.random() * 3) + 1,
      },
      recent_actions: bookings.slice(0, 5).map((b) => ({
        booking_id: b.id,
        action: "booking_updated",
        details: `Status moved to ${b.status}`,
        created_at: new Date().toISOString(),
      })),
    }
    return { success: true, data: activity } as ApiEnvelope<UserActivity>
  },

  async moderateBarber(barberId: number, payload: { status: ModerationStatus; reason?: string }) {
    await sleep(250)
    const barber = barbers.find((b) => b.id === barberId)
    if (!barber) return { success: false, message: "Barber not found" } as ApiEnvelope<never>
    barber.status = payload.status
    return { success: true, data: barber } as ApiEnvelope<Barber>
  },

  async getBarbers(page = 1, per_page = 10) {
    await sleep()
    return { success: true, data: paginate(barbers, page, per_page) } as ApiEnvelope<PaginatedResponse<Barber>>
  },

  async moderateSalon(salonId: number, payload: { status: ModerationStatus; reason?: string }) {
    await sleep(250)
    const salon = salons.find((s) => s.id === salonId)
    if (!salon) return { success: false, message: "Salon not found" } as ApiEnvelope<never>
    salon.status = payload.status
    return { success: true, data: salon } as ApiEnvelope<Salon>
  },

  async getSalons(page = 1, per_page = 10) {
    await sleep()
    return { success: true, data: paginate(salons, page, per_page) } as ApiEnvelope<PaginatedResponse<Salon>>
  },

  async getBookings(params: {
    status?: string
    salon_id?: string
    from?: string
    to?: string
    per_page?: number
    page?: number
  }) {
    await sleep()
    let list = [...bookings]
    if (params.status) list = list.filter((b) => b.status === params.status)
    if (params.salon_id) list = list.filter((b) => b.salon.id === Number(params.salon_id))
    const from = params.from
    const to = params.to
    if (from) list = list.filter((b) => b.date >= from)
    if (to) list = list.filter((b) => b.date <= to)
    return {
      success: true,
      data: paginate(list, params.page, params.per_page),
    } as ApiEnvelope<PaginatedResponse<Booking>>
  },

  async updateBookingStatus(bookingId: string, payload: { status: BookingStatus; reason?: string }) {
    await sleep(250)
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) return { success: false, message: "Booking not found" } as ApiEnvelope<never>
    booking.status = payload.status
    return { success: true, data: booking } as ApiEnvelope<Booking>
  },

  async getDashboardKpis(days = 30) {
    await sleep()
    return { success: true, data: { ...dashboardKpis, period_days: days } } as ApiEnvelope<DashboardKpis>
  },

  async getTrends() {
    await sleep(200)
    return { success: true, data: trends } as ApiEnvelope<TrendPoint[]>
  },

  async getReviews(params: { type?: "all" | "salon" | "barber"; include_hidden?: boolean }) {
    await sleep()
    const includeHidden = params.include_hidden ?? false
    const list = includeHidden ? [...reviews] : reviews.filter((r) => !r.hidden)
    const result = {
      salon_reviews: params.type === "barber" ? [] : list.filter((r) => r.type === "salon"),
      barber_reviews: params.type === "salon" ? [] : list.filter((r) => r.type === "barber"),
    }
    return { success: true, data: result } as ApiEnvelope<{ salon_reviews: Review[]; barber_reviews: Review[] }>
  },

  async moderateReview(type: "salon" | "barber", reviewId: number, payload: { action: "hide" | "unhide" | "delete"; reason?: string }) {
    await sleep(220)
    const review = reviews.find((r) => r.id === reviewId && r.type === type)
    if (!review) return { success: false, message: "Review not found" } as ApiEnvelope<never>
    if (payload.action === "delete") {
      const index = reviews.findIndex((r) => r.id === reviewId && r.type === type)
      reviews.splice(index, 1)
    } else {
      review.hidden = payload.action === "hide"
    }
    return { success: true, message: "Review moderee avec succes" } as ApiEnvelope<null>
  },

  async getDevices(params: { active?: boolean; per_page?: number; page?: number }) {
    await sleep()
    const list = params.active === undefined ? [...devices] : devices.filter((d) => d.is_active === params.active)
    return { success: true, data: paginate(list, params.page, params.per_page) } as ApiEnvelope<PaginatedResponse<Device>>
  },

  async deleteInvalidTokens() {
    await sleep(300)
    const inactiveCount = devices.filter((d) => !d.is_active).length
    return { success: true, data: { deleted_count: inactiveCount } } as ApiEnvelope<{ deleted_count: number }>
  },

  async getTickets(params: { status?: Ticket["status"]; urgency?: Urgency; escalated?: boolean; per_page?: number; page?: number }) {
    await sleep()
    let list = [...tickets]
    if (params.status) list = list.filter((t) => t.status === params.status)
    if (params.urgency) list = list.filter((t) => t.urgency === params.urgency)
    if (params.escalated !== undefined) list = list.filter((t) => t.is_escalated === params.escalated)
    return { success: true, data: paginate(list, params.page, params.per_page) } as ApiEnvelope<PaginatedResponse<Ticket>>
  },

  async assignTicket(ticketId: number, admin_user_id: number) {
    await sleep(240)
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return { success: false, message: "Ticket not found" } as ApiEnvelope<never>
    ticket.assignedAdmin = { id: admin_user_id, name: `Admin ${admin_user_id}`, email: `admin${admin_user_id}@coifly.app` }
    ticket.status = "pending"
    return { success: true, data: ticket } as ApiEnvelope<Ticket>
  },

  async replyTicket(ticketId: number, message: string) {
    await sleep(240)
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return { success: false, message: "Ticket not found" } as ApiEnvelope<never>
    ticket.messages.push({
      id: ticket.messages.length + 1,
      sender: { id: 1, name: "Admin Ops", role: "admin" },
      message,
      created_at: new Date().toISOString(),
    })
    return { success: true, message: "Reponse envoyee" } as ApiEnvelope<null>
  },

  async escalateTicket(ticketId: number) {
    await sleep(220)
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return { success: false, message: "Ticket not found" } as ApiEnvelope<never>
    ticket.is_escalated = true
    return { success: true, data: ticket } as ApiEnvelope<Ticket>
  },

  async closeTicket(ticketId: number) {
    await sleep(220)
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return { success: false, message: "Ticket not found" } as ApiEnvelope<never>
    ticket.status = "resolved"
    ticket.closed_at = new Date().toISOString()
    return { success: true, data: ticket } as ApiEnvelope<Ticket>
  },

  async getSystemStatus() {
    await sleep()
    return { success: true, data: systemServices } as ApiEnvelope<SystemService[]>
  },

  async updateSystemService(serviceKey: string, payload: { status: ServiceStatus; is_active?: boolean }) {
    await sleep(220)
    const service = systemServices.find((s) => s.service_key === serviceKey)
    if (!service) return { success: false, message: "Service not found" } as ApiEnvelope<never>
    service.status = payload.status
    if (typeof payload.is_active === "boolean") service.is_active = payload.is_active
    service.updated_at = new Date().toISOString()
    return { success: true, data: service } as ApiEnvelope<SystemService>
  },

  async getAuditLogs(page = 1, per_page = 10) {
    await sleep()
    return { success: true, data: paginate(auditLogs, page, per_page) } as ApiEnvelope<PaginatedResponse<AuditLog>>
  },
}
