import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { Switch } from "@/components/ui/switch"
import { useSystemStatus, useUpdateSystemService } from "@/lib/hooks/useAdminQueries"
import type { SystemService } from "@/lib/types/admin"

export default function SystemPage() {
  const services = useSystemStatus()
  const update = useUpdateSystemService()

  const columns = useMemo<ColumnDef<SystemService>[]>(
    () => [
      { accessorKey: "service_name", header: "Service" },
      { accessorKey: "service_key", header: "Key" },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "updated_at", header: "Updated at" },
      {
        id: "active",
        header: "Toggle active",
        cell: ({ row }) => (
          <Switch
            checked={row.original.is_active}
            onCheckedChange={(checked) =>
              update.mutate({
                serviceKey: row.original.service_key,
                status: row.original.status,
                is_active: checked,
              })
            }
          />
        ),
      },
    ],
    [update]
  )

  return (
    <div>
      <PageHeader title="System Status" description="Track and update operational health of internal services." />
      <DataTable columns={columns} data={services.data ?? []} page={1} total={services.data?.length ?? 0} perPage={services.data?.length || 1} onPageChange={() => undefined} loading={services.isLoading} />
    </div>
  )
}
