export type AccountStatus = "active" | "suspended" | "banned"
export type UserRole = "client" | "barber" | "salon_owner" | "admin"
export type ModerationStatus = "pending" | "approved" | "refused" | "active" | "inactive"
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show"
export type ServiceStatus = "operational" | "degraded" | "outage"
export type TicketStatus = "open" | "pending" | "resolved"
export type Urgency = "low" | "medium" | "high" | "critical"

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
}

export interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
}

export interface Role {
  id: number
  name: string
  display_name: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  photo_url: string | null
  account_status: AccountStatus
  status_note: string | null
  suspended_at: string | null
  banned_at: string | null
  created_at: string
  roles: Role[]
}

export interface UserActivity {
  user: Pick<User, "id" | "name" | "email">
  stats: {
    bookings_count: number
    reviews_count: number
    tickets_count: number
    devices_count: number
  }
  recent_actions: Array<{
    booking_id: string
    action: string
    details: string
    created_at: string
  }>
}

export interface Barber {
  id: number
  user_id: number
  salon_id: number
  status: ModerationStatus
  is_active: boolean
  bio: string | null
  experience?: number | null
  rating_average?: number
  reviews_count?: number
  photo_url?: string | null
  buffer_minutes?: number
  specialties?: string[]
  user?: {
    id: number
    name: string
    email: string
    phone: string
    photo_url: string | null
  }
  salon?: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

export interface Salon {
  id: number
  owner_id: number
  name: string
  status: ModerationStatus
  is_active: boolean
  address: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  client_id: number
  salon_id: number
  barber_id: number
  status: BookingStatus
  booking_date: string
  start_time: string
  end_time: string
  total_price: string
  confirmed_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancelled_by?: number
  cancellation_reason?: string
  updated_at?: string
  salon: {
    id: number
    name: string
  }
  client: {
    id: number
    name: string
    email: string
  }
}

export interface DashboardKpis {
  period_days: number
  bookings_total: number
  bookings_completed: number
  bookings_cancelled: number
  bookings_no_show: number
  cancellation_rate: number
  no_show_rate: number
  revenue_completed: number
  active_tickets: number
  queued_jobs: number
  failed_jobs: number
  total_users?: number
  active_barbers?: number
  active_salons?: number
  bookings_today?: number
  revenue_today?: number
  system_status?: ServiceStatus
}

export interface SalonReview {
  id: number
  salon_id: number
  client_id: number
  rating: number
  comment: string
  is_hidden: boolean
  moderated_by: number | null
  moderated_at: string | null
  moderation_reason: string | null
  salon: {
    id: number
    name: string
  }
  user: Pick<User, "id" | "name" | "email">
}

export interface BarberReview {
  id: number
  booking_id: number
  barber_id: number
  client_id: number
  rating: number
  comment: string
  is_hidden: boolean
  barber: {
    id: number
    user_id: number
  }
  user: Pick<User, "id" | "name" | "email">
}

export type Review = SalonReview | BarberReview

export interface Device {
  id: number
  user_id: number
  device_token: string
  platform: "ios" | "android" | "web"
  is_active: boolean
  created_at: string
  user: Pick<User, "id" | "name" | "email">
}

export interface TicketMessage {
  id: number
  ticket_id: number
  from: "client" | "admin"
  text: string
  created_at: string
  sender: {
    id: number
    name: string
    email: string
  }
}

export interface Ticket {
  id: number
  user_id: number
  subject: string
  status: TicketStatus
  urgency: Urgency
  is_escalated: boolean
  escalated_at: string | null
  assigned_admin_id: number | null
  closed_at: string | null
  last_update_at: string
  user: Pick<User, "id" | "name" | "email">
  assigned_admin: Pick<User, "id" | "name" | "email"> | null
  messages: TicketMessage[]
}

export interface SystemService {
  id: number
  service_key: string
  service_name: string
  status: ServiceStatus
  is_active: boolean
  sort_order: number
  updated_at: string
}

export interface AuditLog {
  id: number
  admin_user: string
  action: string
  target: string
  ip_address: string
  created_at: string
}

export interface TrendPoint {
  date: string
  bookings: number
  revenue: number
  newUsers: number
  cancellationRate: number
}
