import { useEffect, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts"
import { AlertTriangle, BadgeDollarSign, CalendarDays, Store, Ticket, Users, Activity } from "lucide-react"
import { ChartWidget } from "@/components/dashboard/ChartWidget"
import { ErrorState, LoadingState } from "@/components/dashboard/QueryState"
import { StatsWidget } from "@/components/dashboard/StatsWidget"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { useBookings, useDashboardKpis, useDashboardTrends, useReviews, useTickets } from "@/lib/hooks/useAdminQueries"
import type { Booking, SalonReview, BarberReview, Ticket as TicketType } from "@/lib/types/admin"

// Helper function to determine review type and get display name
function getReviewTarget(review: SalonReview | BarberReview): { type: string; name: string } {
  if ("salon" in review) {
    return { type: "Salon", name: review.salon.name }
  } else {
    return { type: "Barber", name: `Barber #${review.barber_id}` }
  }
}

export default function DashboardPage() {
  const kpis = useDashboardKpis(30)
  const trends = useDashboardTrends()
  const recentBookings = useBookings({ per_page: 6, page: 1 })
  const recentTickets = useTickets({ per_page: 6, page: 1 })
  const recentReviews = useReviews("all", false)

  useEffect(() => {
    if (!kpis.data) return
    const kpiData = kpis.data
    const missingWidgetFields = ["bookings_total", "bookings_completed", "cancellation_rate", "no_show_rate"].filter(
      (field) => !(field in kpiData)
    )

    console.group("[Dashboard] KPI payload debug")
    console.log("raw kpis data:", kpiData)
    console.log("kpi keys:", Object.keys(kpiData))
    if (missingWidgetFields.length > 0) {
      console.warn("[Dashboard] Missing KPI fields for widgets:", missingWidgetFields)
    }
    console.log("mapped widget values:", {
      bookings_total: kpiData.bookings_total,
      bookings_completed: kpiData.bookings_completed,
      bookings_cancelled: kpiData.bookings_cancelled,
      bookings_no_show: kpiData.bookings_no_show,
      cancellation_rate: kpiData.cancellation_rate,
      no_show_rate: kpiData.no_show_rate,
      revenue_completed: kpiData.revenue_completed,
      active_tickets: kpiData.active_tickets,
      queued_jobs: kpiData.queued_jobs,
      failed_jobs: kpiData.failed_jobs,
    })
    console.groupEnd()
  }, [kpis.data])

  useEffect(() => {
    if (!trends.data) return
    console.log("[Dashboard] trends payload:", trends.data)
  }, [trends.data])

  const bookingColumns = useMemo<ColumnDef<Booking>[]>(
    () => [
      { accessorKey: "id", header: "Booking ID" },
      { accessorFn: (row) => row.client?.name ?? `Client #${row.client_id ?? "N/A"}`, id: "client", header: "Client" },
      { accessorFn: (row) => row.salon?.name ?? `Salon #${row.salon_id ?? "N/A"}`, id: "salon", header: "Salon" },
      { accessorKey: "booking_date", header: "Date" },
      { accessorFn: (row) => `${row.total_price} EUR`, id: "price", header: "Price" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  )

  const ticketColumns = useMemo<ColumnDef<TicketType>[]>(
    () => [
      { accessorKey: "id", header: "Ticket ID" },
      { accessorFn: (row) => row.user.name, id: "user", header: "User" },
      { accessorKey: "urgency", header: "Urgency", cell: ({ row }) => <StatusBadge status={row.original.urgency} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    ],
    []
  )

  const reviewRows = useMemo(() => {
    const payload = recentReviews.data
    if (!payload) return []
    return [...payload.salon_reviews, ...payload.barber_reviews].slice(0, 8)
  }, [recentReviews.data])

  const reviewColumns = useMemo<ColumnDef<SalonReview | BarberReview>[]>(
    () => [
      { accessorFn: (row) => row.user.name, id: "user", header: "User" },
      { accessorKey: "rating", header: "Rating", cell: ({ row }) => `${row.original.rating}/5` },
      { accessorFn: (row) => {
        const target = getReviewTarget(row)
        return `${target.type}: ${target.name}`
      }, id: "target", header: "Target" },
      { accessorFn: (row) => (row.is_hidden ? "hidden" : "visible"), id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.is_hidden ? "inactive" : "active"} /> },
    ],
    []
  )

  if (kpis.isLoading || trends.isLoading) return <LoadingState />
  if (kpis.isError || trends.isError || !kpis.data || !trends.data) {
    const errorMsg = kpis.error instanceof Error ? kpis.error.message : trends.error instanceof Error ? trends.error.message : "Failed to load dashboard data."
    return <ErrorState message={errorMsg} />
  }

  const completionRate =
    kpis.data.bookings_total > 0
      ? Number(((kpis.data.bookings_completed / kpis.data.bookings_total) * 100).toFixed(2))
      : 0

  const statsCards = [
    { label: "Bookings Total", value: String(kpis.data.bookings_total), icon: CalendarDays },
    {
      label: "Bookings Completed",
      value: String(kpis.data.bookings_completed),
      icon: Activity,
      delta: completionRate,
    },
    {
      label: "Bookings Cancelled",
      value: String(kpis.data.bookings_cancelled),
      icon: AlertTriangle,
      delta: Number(kpis.data.cancellation_rate ?? 0),
    },
    {
      label: "Bookings No Show",
      value: String(kpis.data.bookings_no_show),
      icon: Ticket,
      delta: Number(kpis.data.no_show_rate ?? 0),
    },
    {
      label: "Revenue Completed",
      value: `${kpis.data.revenue_completed ?? 0} EUR`,
      icon: BadgeDollarSign,
    },
    { label: "Active Tickets", value: String(kpis.data.active_tickets ?? 0), icon: Ticket },
    { label: "Queued Jobs", value: String(kpis.data.queued_jobs ?? 0), icon: Users },
    { label: "Failed Jobs", value: String(kpis.data.failed_jobs ?? 0), icon: Store },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Operational overview of Coifly marketplace and system health.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <StatsWidget key={card.label} label={card.label} value={card.value} icon={card.icon} delta={card.delta} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartWidget title="Bookings Per Day" subtitle="Daily booking volume">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line dataKey="bookings" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="Revenue Per Day" subtitle="Completed booking revenue">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends.data}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="New Users Growth" subtitle="User acquisition trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line dataKey="newUsers" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="Cancellation Rate" subtitle="Percentage of cancelled bookings">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line dataKey="cancellationRate" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWidget>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Recent Bookings</h2>
          <DataTable
            columns={bookingColumns}
            data={recentBookings.data?.data ?? []}
            page={1}
            total={recentBookings.data?.total ?? 0}
            perPage={6}
            onPageChange={() => undefined}
            loading={recentBookings.isLoading}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Recent Support Tickets</h2>
            <DataTable
              columns={ticketColumns}
              data={recentTickets.data?.data ?? []}
              page={1}
              total={recentTickets.data?.total ?? 0}
              perPage={6}
              onPageChange={() => undefined}
              loading={recentTickets.isLoading}
            />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Recent Reviews</h2>
            <DataTable columns={reviewColumns} data={reviewRows} page={1} total={reviewRows.length} perPage={8} onPageChange={() => undefined} loading={recentReviews.isLoading} />
          </div>
        </div>
      </section>
    </div>
  )
}
