import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { ErrorState } from "@/components/dashboard/QueryState"
import { ActionDropdown } from "@/components/dashboard/ActionDropdown"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAssignUserRole, useUpdateUserStatus, useUsers } from "@/lib/hooks/useAdminQueries"
import type { User } from "@/lib/types/admin"

const PAGE_SIZE = 10

function formatUserRoles(user: User) {
  if (!Array.isArray(user.roles) || user.roles.length === 0) return "No role"
  return user.roles.map((role) => role.display_name || role.name).join(", ")
}

function resolveUserStatus(user: User) {
  const accountStatus = (user as User & { account_status?: string }).account_status
  if (accountStatus) return accountStatus

  const extended = user as User & { suspended_at?: string | null; banned_at?: string | null; deleted_at?: string | null }
  if (extended.banned_at || extended.deleted_at) return "banned"
  if (extended.suspended_at) return "suspended"
  return "active"
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")

  const usersQuery = useUsers({
    page,
    per_page: PAGE_SIZE,
    search: search || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
  })

  const updateStatus = useUpdateUserStatus()
  const assignRole = useAssignUserRole()

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorFn: (row) => formatUserRoles(row), id: "role", header: "Role" },
      { accessorFn: (row) => resolveUserStatus(row), id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={resolveUserStatus(row.original)} /> },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionDropdown
            actions={[
              { label: "View", onClick: () => window.alert(`View user ${row.original.id}`) },
              { label: "Suspend", onClick: () => updateStatus.mutate({ userId: row.original.id, status: "suspended" }) },
              { label: "Ban", onClick: () => updateStatus.mutate({ userId: row.original.id, status: "banned" }), destructive: true },
              { label: "Assign Admin Role", onClick: () => assignRole.mutate({ userId: row.original.id, role: "admin", replace: false }) },
            ]}
          />
        ),
      },
    ],
    [assignRole, updateStatus]
  )

  return (
    <div>
      <PageHeader title="Users" description="Manage accounts, statuses and platform roles." />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name, email, phone" />
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="barber">Barber</SelectItem>
            <SelectItem value="salon_owner">Salon owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {usersQuery.isError ? (
        <ErrorState message={usersQuery.error instanceof Error ? usersQuery.error.message : "Unable to fetch users"} />
      ) : null}
      <DataTable
        columns={columns}
        data={usersQuery.data?.data ?? []}
        page={usersQuery.data?.current_page ?? page}
        total={usersQuery.data?.total ?? 0}
        perPage={PAGE_SIZE}
        onPageChange={setPage}
        loading={usersQuery.isLoading}
      />
    </div>
  )
}
