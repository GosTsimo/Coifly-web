import { useEffect, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area, ReferenceLine } from "recharts"
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

function formatTrendDate(input: string) {
  const date = new Date(input)
  return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-border/70 bg-background/95 p-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-semibold">{item.value ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
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

  const trendPoints = trends.data

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

  const chartData = useMemo(
    () =>
      trendPoints.map((point) => ({
        ...point,
        shortDate: formatTrendDate(point.date),
      })),
    [trendPoints]
  )

  const avgCancellationRate = useMemo(() => {
    if (trendPoints.length === 0) return 0
    const sum = trendPoints.reduce((acc, point) => acc + point.cancellationRate, 0)
    return Number((sum / trendPoints.length).toFixed(2))
  }, [trendPoints])

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
            <LineChart data={chartData} margin={{ top: 16, right: 12, left: 2, bottom: 6 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 2, fill: "#16a34a" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="Revenue Per Day" subtitle="Completed booking revenue">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 12, left: 2, bottom: 6 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.72} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} minTickGap={24} />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const value = Number(payload[0]?.value ?? 0)
                  return (
                    <div className="rounded-xl border border-border/70 bg-background/95 p-3 shadow-xl backdrop-blur-sm">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold">Revenue: {formatCurrency(value)}</p>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="New Users Growth" subtitle="User acquisition trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 12, left: 2, bottom: 6 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="newUsers"
                name="New Users"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 2, fill: "#f59e0b" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="Cancellation Rate" subtitle="Percentage of cancelled bookings">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 12, left: 2, bottom: 6 }}>
              <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" domain={[0, 100]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const value = Number(payload[0]?.value ?? 0)
                  return (
                    <div className="rounded-xl border border-border/70 bg-background/95 p-3 shadow-xl backdrop-blur-sm">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold">Cancellation: {value}%</p>
                      <p className="text-xs text-muted-foreground">Average: {avgCancellationRate}%</p>
                    </div>
                  )
                }}
              />
              <ReferenceLine
                y={avgCancellationRate}
                stroke="#f97316"
                strokeDasharray="6 6"
                ifOverflow="extendDomain"
                label={{ value: `Avg ${avgCancellationRate}%`, fill: "#f97316", fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="cancellationRate"
                name="Cancellation Rate"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 2, fill: "#ef4444" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
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
