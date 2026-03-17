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

export interface User {
  id: number
  name: string
  email: string
  phone: string
  roles: UserRole[]
  account_status: AccountStatus
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
  name: string
  email: string
  phone: string
  status: ModerationStatus
  city: string
  rating: number
}

export interface Salon {
  id: number
  name: string
  owner_name: string
  city: string
  status: ModerationStatus
  rating: number
}

export interface Booking {
  id: string
  client: {
    id: number
    name: string
    email: string
  }
  salon: {
    id: number
    name: string
  }
  date: string
  price: number
  status: BookingStatus
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
  total_users: number
  active_barbers: number
  active_salons: number
  bookings_today: number
  revenue_today: number
  system_status: ServiceStatus
}

export interface Review {
  id: number
  type: "salon" | "barber"
  user_name: string
  rating: number
  target_name: string
  content: string
  hidden: boolean
  created_at: string
}

export interface Device {
  id: number
  user: Pick<User, "id" | "name" | "email">
  platform: "ios" | "android" | "web"
  token: string
  is_active: boolean
  last_seen_at: string
}

export interface TicketMessage {
  id: number
  sender: {
    id: number
    name: string
    role: "user" | "admin"
  }
  message: string
  created_at: string
}

export interface Ticket {
  id: number
  subject: string
  urgency: Urgency
  status: TicketStatus
  is_escalated: boolean
  user: Pick<User, "id" | "name" | "email">
  assignedAdmin?: Pick<User, "id" | "name" | "email">
  messages: TicketMessage[]
  created_at: string
  closed_at?: string
}

export interface SystemService {
  service_key: string
  service_name: string
  status: ServiceStatus
  is_active: boolean
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
