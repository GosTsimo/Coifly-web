import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { ActionDropdown } from "@/components/dashboard/ActionDropdown"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBookings, useUpdateBookingStatus } from "@/lib/hooks/useAdminQueries"
import type { Booking } from "@/lib/types/admin"

const PAGE_SIZE = 10

export default function BookingsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("all")
  const [salonId, setSalonId] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const bookingQuery = useBookings({
    page,
    per_page: PAGE_SIZE,
    status: status === "all" ? undefined : status,
    salon_id: salonId || undefined,
    from: from || undefined,
    to: to || undefined,
  })
  const updateBooking = useUpdateBookingStatus()

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      { accessorKey: "id", header: "Booking ID" },
      { accessorFn: (row) => row.client.name, id: "client", header: "Client" },
      { accessorFn: (row) => row.salon.name, id: "salon", header: "Salon" },
      { accessorKey: "booking_date", header: "Date" },
      { accessorFn: (row) => `${row.total_price} EUR`, id: "price", header: "Price" },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionDropdown
            actions={[
              { label: "Confirm", onClick: () => updateBooking.mutate({ bookingId: row.original.id, status: "confirmed" }) },
              { label: "Cancel", onClick: () => updateBooking.mutate({ bookingId: row.original.id, status: "cancelled" }) },
              { label: "Complete", onClick: () => updateBooking.mutate({ bookingId: row.original.id, status: "completed" }) },
              { label: "No Show", onClick: () => updateBooking.mutate({ bookingId: row.original.id, status: "no_show" }) },
            ]}
          />
        ),
      },
    ],
    [updateBooking]
  )

  return (
    <div>
      <PageHeader title="Bookings" description="Filter and moderate booking lifecycle states." />
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="no_show">No show</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Salon ID" value={salonId} onChange={(e) => { setSalonId(e.target.value); setPage(1) }} />
        <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} />
        <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} />
      </div>
      <DataTable
        columns={columns}
        data={bookingQuery.data?.data ?? []}
        page={bookingQuery.data?.current_page ?? page}
        total={bookingQuery.data?.total ?? 0}
        perPage={PAGE_SIZE}
        onPageChange={setPage}
        loading={bookingQuery.isLoading}
      />
    </div>
  )
}
