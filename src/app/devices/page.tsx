import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeleteInvalidTokens, useDevices } from "@/lib/hooks/useAdminQueries"
import type { Device } from "@/lib/types/admin"

const PAGE_SIZE = 10

export default function DevicesPage() {
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState("all")

  const devicesQuery = useDevices({
    page,
    per_page: PAGE_SIZE,
    active: activeFilter === "all" ? undefined : activeFilter === "active",
  })
  const cleanTokens = useDeleteInvalidTokens()

  const columns = useMemo<ColumnDef<Device>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorFn: (row) => row.user.name, id: "user", header: "User" },
      { accessorFn: (row) => row.user.email, id: "email", header: "Email" },
      { accessorKey: "platform", header: "Platform" },
      { accessorKey: "token", header: "Device Token" },
      { accessorFn: (row) => (row.is_active ? "active" : "inactive"), id: "active", header: "Active", cell: ({ row }) => <StatusBadge status={row.original.is_active ? "active" : "inactive"} /> },
    ],
    []
  )

  return (
    <div>
      <PageHeader
        title="Devices"
        description="Track user device sessions and token validity."
        action={
          <Button variant="outline" onClick={() => cleanTokens.mutate()}>
            Delete invalid tokens
          </Button>
        }
      />

      <div className="mb-4 w-[220px]">
        <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All devices</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={devicesQuery.data?.data ?? []}
        page={devicesQuery.data?.current_page ?? page}
        total={devicesQuery.data?.total ?? 0}
        perPage={PAGE_SIZE}
        onPageChange={setPage}
        loading={devicesQuery.isLoading}
      />
    </div>
  )
}
