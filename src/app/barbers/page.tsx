import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { ActionDropdown } from "@/components/dashboard/ActionDropdown"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { useBarbers, useModerateBarber } from "@/lib/hooks/useAdminQueries"
import type { Barber } from "@/lib/types/admin"

const PAGE_SIZE = 10

export default function BarbersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useBarbers(page, PAGE_SIZE)
  const moderate = useModerateBarber()

  const columns = useMemo<ColumnDef<Barber>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorFn: (row) => row.user?.name ?? `User #${row.user_id}`, id: "name", header: "Name" },
      { accessorFn: (row) => row.user?.email ?? "-", id: "email", header: "Email" },
      { accessorFn: (row) => row.user?.phone ?? "-", id: "phone", header: "Phone" },
      { accessorFn: (row) => row.salon?.name ?? `Salon #${row.salon_id}`, id: "salon", header: "Salon" },
      { accessorFn: (row) => row.experience ?? 0, id: "experience", header: "Exp" },
      { accessorFn: (row) => row.rating_average ?? 0, id: "rating", header: "Rating" },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionDropdown
            actions={[
              { label: "Approve", onClick: () => moderate.mutate({ barberId: row.original.id, status: "approved" }) },
              { label: "Reject", onClick: () => moderate.mutate({ barberId: row.original.id, status: "refused" }), destructive: true },
              { label: "Deactivate", onClick: () => moderate.mutate({ barberId: row.original.id, status: "inactive" }) },
            ]}
          />
        ),
      },
    ],
    [moderate]
  )

  return (
    <div>
      <PageHeader title="Barbers" description="Review and moderate barber onboarding and activity." />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        page={data?.current_page ?? page}
        total={data?.total ?? 0}
        perPage={PAGE_SIZE}
        onPageChange={setPage}
        loading={isLoading}
      />
    </div>
  )
}
