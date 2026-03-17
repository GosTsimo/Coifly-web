import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { ActionDropdown } from "@/components/dashboard/ActionDropdown"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { useModerateSalon, useSalons } from "@/lib/hooks/useAdminQueries"
import type { Salon } from "@/lib/types/admin"

const PAGE_SIZE = 10

export default function SalonsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSalons(page, PAGE_SIZE)
  const moderate = useModerateSalon()

  const columns = useMemo<ColumnDef<Salon>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Salon" },
      { accessorFn: (row) => row.owner?.name ?? `Owner #${row.owner_id}`, id: "owner", header: "Owner" },
      { accessorFn: (row) => row.address ?? "-", id: "address", header: "Address" },
      { accessorFn: (row) => row.rating_average ?? 0, id: "rating", header: "Rating" },
      { accessorFn: (row) => row.reviews_count ?? 0, id: "reviews", header: "Reviews" },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionDropdown
            actions={[
              { label: "Approve", onClick: () => moderate.mutate({ salonId: row.original.id, status: "approved" }) },
              { label: "Reject", onClick: () => moderate.mutate({ salonId: row.original.id, status: "refused" }), destructive: true },
              { label: "View", onClick: () => window.alert(`View salon ${row.original.id}`) },
            ]}
          />
        ),
      },
    ],
    [moderate]
  )

  return (
    <div>
      <PageHeader title="Salons" description="Moderate salon accounts and monitor quality signals." />
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
