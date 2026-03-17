import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DataTable } from "@/components/tables/DataTable"
import { useAuditLogs } from "@/lib/hooks/useAdminQueries"
import type { AuditLog } from "@/lib/types/admin"

const PAGE_SIZE = 12

export default function AuditPage() {
  const [page, setPage] = useState(1)
  const logsQuery = useAuditLogs(page, PAGE_SIZE)

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "admin_user", header: "Admin user" },
      { accessorKey: "action", header: "Action" },
      { accessorKey: "target", header: "Target" },
      { accessorKey: "ip_address", header: "IP address" },
      { accessorKey: "created_at", header: "Timestamp" },
    ],
    []
  )

  return (
    <div>
      <PageHeader title="Audit Logs" description="Admin activity timeline for compliance and traceability." />
      <DataTable
        columns={columns}
        data={logsQuery.data?.data ?? []}
        page={logsQuery.data?.current_page ?? page}
        total={logsQuery.data?.total ?? 0}
        perPage={PAGE_SIZE}
        onPageChange={setPage}
        loading={logsQuery.isLoading}
      />
    </div>
  )
}
