import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts"
import { AlertTriangle, BadgeDollarSign, CalendarDays, Scissors, Store, Ticket, Users, Activity } from "lucide-react"
import { ChartWidget } from "@/components/dashboard/ChartWidget"
import { ErrorState, LoadingState } from "@/components/dashboard/QueryState"
import { StatsWidget } from "@/components/dashboard/StatsWidget"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { useBookings, useDashboardKpis, useDashboardTrends, useReviews, useTickets } from "@/lib/hooks/useAdminQueries"
import type { Booking, Review, Ticket as TicketType } from "@/lib/types/admin"

export default function DashboardPage() {
  const kpis = useDashboardKpis(30)
  const trends = useDashboardTrends()
  const recentBookings = useBookings({ per_page: 6, page: 1 })
  const recentTickets = useTickets({ per_page: 6, page: 1 })
  const recentReviews = useReviews("all", false)

  const bookingColumns = useMemo<ColumnDef<Booking>[]>(
    () => [
      { accessorKey: "id", header: "Booking ID" },
      { accessorFn: (row) => row.client.name, id: "client", header: "Client" },
      { accessorFn: (row) => row.salon.name, id: "salon", header: "Salon" },
      { accessorKey: "date", header: "Date" },
      { accessorFn: (row) => `${row.price} EUR`, id: "price", header: "Price" },
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

  const reviewColumns = useMemo<ColumnDef<Review>[]>(
    () => [
      { accessorFn: (row) => row.user_name, id: "user", header: "User" },
      { accessorKey: "rating", header: "Rating", cell: ({ row }) => `${row.original.rating}/5` },
      { accessorFn: (row) => `${row.type}: ${row.target_name}`, id: "target", header: "Target" },
      { accessorFn: (row) => (row.hidden ? "hidden" : "visible"), id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.hidden ? "inactive" : "active"} /> },
    ],
    []
  )

  if (kpis.isLoading || trends.isLoading) return <LoadingState />
  if (kpis.isError || trends.isError || !kpis.data || !trends.data) return <ErrorState message="Failed to load dashboard data." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Operational overview of Coifly marketplace and system health.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsWidget label="Total Users" value={String(kpis.data.total_users)} icon={Users} delta={6.2} />
        <StatsWidget label="Active Barbers" value={String(kpis.data.active_barbers)} icon={Scissors} delta={2.8} />
        <StatsWidget label="Active Salons" value={String(kpis.data.active_salons)} icon={Store} delta={4.1} />
        <StatsWidget label="Bookings Today" value={String(kpis.data.bookings_today)} icon={CalendarDays} delta={3.3} />
        <StatsWidget label="Revenue Today" value={`${kpis.data.revenue_today} EUR`} icon={BadgeDollarSign} delta={5.4} />
        <StatsWidget label="Open Support Tickets" value={String(kpis.data.active_tickets)} icon={Ticket} delta={-1.4} />
        <StatsWidget label="Failed Jobs" value={String(kpis.data.failed_jobs)} icon={AlertTriangle} delta={-7.1} />
        <StatsWidget label="System Status" value={kpis.data.system_status} icon={Activity} />
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
