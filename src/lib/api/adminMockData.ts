import type {
  AuditLog,
  Barber,
  Booking,
  DashboardKpis,
  Device,
  Review,
  Salon,
  SystemService,
  Ticket,
  TrendPoint,
  User,
  UserRole,
} from "@/lib/types/admin"

const statuses = ["active", "suspended", "banned"] as const
const roles: UserRole[] = ["client", "barber", "salon_owner", "admin"]
const names = [
  "Amira Benali",
  "Leo Martin",
  "Sofia Chen",
  "Jules Nkosi",
  "Mina Rossi",
  "Noah Laurent",
  "Rania Idriss",
  "Hugo Simon",
  "Lina Duarte",
  "Yanis Haddad",
]

export const users: User[] = Array.from({ length: 84 }).map((_, i) => {
  const name = names[i % names.length]
  const role = roles[i % roles.length]
  return {
    id: i + 1,
    name: `${name} ${i + 1}`,
    email: `user${i + 1}@coifly.app`,
    phone: `+33 6 10 20 ${(10 + i).toString().padStart(2, "0")}`,
    roles: [role],
    account_status: statuses[i % statuses.length],
  }
})

export const barbers: Barber[] = Array.from({ length: 36 }).map((_, i) => ({
  id: i + 1,
  name: `Barber ${i + 1}`,
  email: `barber${i + 1}@coifly.app`,
  phone: `+33 7 20 30 ${(10 + i).toString().padStart(2, "0")}`,
  status: (["pending", "approved", "refused", "active", "inactive"] as const)[i % 5],
  city: ["Paris", "Lyon", "Marseille", "Lille"][i % 4],
  rating: Number((3.8 + (i % 10) * 0.12).toFixed(1)),
}))

export const salons: Salon[] = Array.from({ length: 28 }).map((_, i) => ({
  id: i + 1,
  name: `Salon ${i + 1}`,
  owner_name: `Owner ${i + 1}`,
  city: ["Paris", "Lyon", "Toulouse", "Bordeaux"][i % 4],
  status: (["pending", "approved", "refused", "active", "inactive"] as const)[(i + 2) % 5],
  rating: Number((4.0 + (i % 8) * 0.1).toFixed(1)),
}))

export const bookings: Booking[] = Array.from({ length: 110 }).map((_, i) => {
  const day = ((i % 28) + 1).toString().padStart(2, "0")
  return {
    id: `BK-${(1000 + i).toString()}`,
    client: {
      id: (i % users.length) + 1,
      name: users[i % users.length].name,
      email: users[i % users.length].email,
    },
    salon: {
      id: (i % salons.length) + 1,
      name: salons[i % salons.length].name,
    },
    date: `2026-03-${day}`,
    price: 18 + (i % 9) * 5,
    status: (["pending", "confirmed", "cancelled", "completed", "no_show"] as const)[i % 5],
  }
})

export const reviews: Review[] = Array.from({ length: 60 }).map((_, i) => ({
  id: i + 1,
  type: i % 2 === 0 ? "salon" : "barber",
  user_name: users[i % users.length].name,
  rating: (i % 5) + 1,
  target_name: i % 2 === 0 ? salons[i % salons.length].name : barbers[i % barbers.length].name,
  content: `Feedback ${i + 1} about appointment quality and service timing.`,
  hidden: i % 7 === 0,
  created_at: `2026-03-${((i % 28) + 1).toString().padStart(2, "0")}T10:20:00Z`,
}))

export const devices: Device[] = Array.from({ length: 70 }).map((_, i) => ({
  id: i + 1,
  user: {
    id: users[i % users.length].id,
    name: users[i % users.length].name,
    email: users[i % users.length].email,
  },
  platform: (["ios", "android", "web"] as const)[i % 3],
  token: `dev_${Math.random().toString(36).slice(2, 16)}_${i + 1}`,
  is_active: i % 4 !== 0,
  last_seen_at: `2026-03-${((i % 28) + 1).toString().padStart(2, "0")}T12:00:00Z`,
}))

export const tickets: Ticket[] = Array.from({ length: 42 }).map((_, i) => ({
  id: i + 1,
  subject: `Issue #${i + 1} with booking flow`,
  urgency: (["low", "medium", "high", "critical"] as const)[i % 4],
  status: (["open", "pending", "resolved"] as const)[i % 3],
  is_escalated: i % 6 === 0,
  user: {
    id: users[i % users.length].id,
    name: users[i % users.length].name,
    email: users[i % users.length].email,
  },
  assignedAdmin: i % 2 === 0 ? { id: 4, name: "Admin Ops", email: "admin@coifly.app" } : undefined,
  messages: [
    {
      id: i * 2 + 1,
      sender: { id: users[i % users.length].id, name: users[i % users.length].name, role: "user" },
      message: "I have an issue with my last booking.",
      created_at: `2026-03-${((i % 28) + 1).toString().padStart(2, "0")}T09:00:00Z`,
    },
    {
      id: i * 2 + 2,
      sender: { id: 4, name: "Admin Ops", role: "admin" },
      message: "Thanks, we are checking this now.",
      created_at: `2026-03-${((i % 28) + 1).toString().padStart(2, "0")}T09:05:00Z`,
    },
  ],
  created_at: `2026-03-${((i % 28) + 1).toString().padStart(2, "0")}T08:55:00Z`,
}))

export const systemServices: SystemService[] = [
  { service_key: "api", service_name: "Public API", status: "operational", is_active: true, updated_at: "2026-03-17T08:00:00Z" },
  { service_key: "booking-worker", service_name: "Booking Worker", status: "degraded", is_active: true, updated_at: "2026-03-17T08:02:00Z" },
  { service_key: "notifications", service_name: "Notifications", status: "operational", is_active: true, updated_at: "2026-03-17T08:03:00Z" },
  { service_key: "search", service_name: "Search Index", status: "outage", is_active: false, updated_at: "2026-03-17T07:58:00Z" },
]

export const auditLogs: AuditLog[] = Array.from({ length: 95 }).map((_, i) => ({
  id: i + 1,
  admin_user: ["Admin Ops", "Support Lead", "Head of Growth"][i % 3],
  action: ["UPDATED_BOOKING", "BANNED_USER", "HID_REVIEW", "CLOSED_TICKET"][i % 4],
  target: ["Booking", "User", "Review", "Ticket"][i % 4] + ` #${100 + i}`,
  ip_address: `192.168.1.${(10 + i) % 255}`,
  created_at: `2026-03-${((i % 28) + 1).toString().padStart(2, "0")}T${(8 + (i % 10)).toString().padStart(2, "0")}:15:00Z`,
}))

export const trends: TrendPoint[] = Array.from({ length: 30 }).map((_, i) => ({
  date: `2026-02-${(i + 1).toString().padStart(2, "0")}`,
  bookings: 80 + (i % 8) * 9,
  revenue: 1800 + (i % 10) * 210,
  newUsers: 18 + (i % 7) * 4,
  cancellationRate: Number((3 + (i % 6) * 0.9).toFixed(1)),
}))

export const dashboardKpis: DashboardKpis = {
  period_days: 30,
  bookings_total: 3420,
  bookings_completed: 2975,
  bookings_cancelled: 278,
  bookings_no_show: 167,
  cancellation_rate: 8.1,
  no_show_rate: 4.9,
  revenue_completed: 128420,
  active_tickets: 23,
  queued_jobs: 17,
  failed_jobs: 3,
  total_users: users.length,
  active_barbers: barbers.filter((b) => b.status === "active" || b.status === "approved").length,
  active_salons: salons.filter((s) => s.status === "active" || s.status === "approved").length,
  bookings_today: 143,
  revenue_today: 5280,
  system_status: "degraded",
}
