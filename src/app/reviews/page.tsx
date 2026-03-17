import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { ActionDropdown } from "@/components/dashboard/ActionDropdown"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useModerateReview, useReviews } from "@/lib/hooks/useAdminQueries"
import type { Review } from "@/lib/types/admin"

export default function ReviewsPage() {
  const [type, setType] = useState<"all" | "salon" | "barber">("all")
  const [includeHidden, setIncludeHidden] = useState(false)
  const { data, isLoading } = useReviews(type, includeHidden)
  const moderate = useModerateReview()

  const rows = useMemo(() => {
    if (!data) return []
    return [...data.salon_reviews, ...data.barber_reviews]
  }, [data])

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      { accessorFn: (row) => row.user_name, id: "user", header: "User" },
      { accessorKey: "rating", header: "Rating", cell: ({ row }) => `${row.original.rating}/5` },
      { accessorFn: (row) => `${row.type}: ${row.target_name}`, id: "target", header: "Target" },
      { accessorFn: (row) => (row.hidden ? "hidden" : "visible"), id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.hidden ? "inactive" : "active"} /> },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionDropdown
            actions={[
              { label: "Hide", onClick: () => moderate.mutate({ type: row.original.type, reviewId: row.original.id, action: "hide" }) },
              { label: "Unhide", onClick: () => moderate.mutate({ type: row.original.type, reviewId: row.original.id, action: "unhide" }) },
              { label: "Delete", onClick: () => moderate.mutate({ type: row.original.type, reviewId: row.original.id, action: "delete" }), destructive: true },
            ]}
          />
        ),
      },
    ],
    [moderate]
  )

  return (
    <div>
      <PageHeader title="Reviews" description="Moderation queue for salon and barber reviews." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={type} onValueChange={(v: "all" | "salon" | "barber") => setType(v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="salon">Salon</SelectItem>
            <SelectItem value="barber">Barber</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={includeHidden} onCheckedChange={setIncludeHidden} />
          Include hidden
        </label>
      </div>
      <DataTable columns={columns} data={rows} page={1} total={rows.length} perPage={rows.length || 1} onPageChange={() => undefined} loading={isLoading} />
    </div>
  )
}
