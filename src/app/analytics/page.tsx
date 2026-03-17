import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts"
import { ChartWidget } from "@/components/dashboard/ChartWidget"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { LoadingState } from "@/components/dashboard/QueryState"
import { useDashboardTrends } from "@/lib/hooks/useAdminQueries"

const topSalons = [
  { name: "Salon 7", revenue: 18200 },
  { name: "Salon 14", revenue: 17000 },
  { name: "Salon 3", revenue: 15500 },
  { name: "Salon 19", revenue: 14800 },
]

const topBarbers = [
  { name: "Barber 8", bookings: 320 },
  { name: "Barber 2", bookings: 294 },
  { name: "Barber 25", bookings: 281 },
  { name: "Barber 11", bookings: 275 },
]

const revenueSplit = [
  { name: "Haircut", value: 43 },
  { name: "Color", value: 22 },
  { name: "Beard", value: 19 },
  { name: "Styling", value: 16 },
]

export default function AnalyticsPage() {
  const trends = useDashboardTrends()
  if (trends.isLoading || !trends.data) return <LoadingState />

  return (
    <div className="space-y-4">
      <PageHeader title="Analytics" description="Business intelligence for growth, revenue and quality." />

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartWidget title="Revenue growth" subtitle="Daily revenue trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="Top salons" subtitle="Revenue contribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSalons}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="Top barbers" subtitle="Completed bookings">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topBarbers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="Revenue mix" subtitle="Service category split">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={revenueSplit} dataKey="value" nameKey="name" outerRadius={90}>
                {["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"].map((c) => (
                  <Cell key={c} fill={c} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>
    </div>
  )
}
