import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Card } from "@/components/dashboard/Card"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreateSystemService, useSystemStatus, useUpdateSystemService } from "@/lib/hooks/useAdminQueries"
import type { ServiceStatus, SystemService } from "@/lib/types/admin"

export default function SystemPage() {
  const services = useSystemStatus()
  const update = useUpdateSystemService()
  const createService = useCreateSystemService()

  const [serviceName, setServiceName] = useState("")
  const [serviceKey, setServiceKey] = useState("")
  const [status, setStatus] = useState<ServiceStatus>("operational")
  const [isActive, setIsActive] = useState(true)

  const handleCreateService = () => {
    const normalizedKey = serviceKey.trim().toLowerCase().replace(/\s+/g, "_")
    if (!serviceName.trim() || !normalizedKey) return

    createService.mutate(
      {
        service_name: serviceName.trim(),
        service_key: normalizedKey,
        status,
        is_active: isActive,
      },
      {
        onSuccess: () => {
          setServiceName("")
          setServiceKey("")
          setStatus("operational")
          setIsActive(true)
        },
      }
    )
  }

  const columns = useMemo<ColumnDef<SystemService>[]>(
    () => [
      { accessorKey: "service_name", header: "Service" },
      { accessorKey: "service_key", header: "Key" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            onValueChange={(nextStatus: ServiceStatus) =>
              update.mutate({
                serviceKey: row.original.service_key,
                status: nextStatus,
                is_active: nextStatus !== "outage",
              })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
              <SelectItem value="outage">Outage</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      { accessorKey: "updated_at", header: "Updated at" },
    ],
    [update]
  )

  return (
    <div>
      <PageHeader title="System Status" description="Track and update operational health of internal services." />
      <Card title="Add Service" description="Create a new monitored service and initial status." className="mb-4">
        <div className="grid gap-3 md:grid-cols-5">
          <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Service name" />
          <Input value={serviceKey} onChange={(e) => setServiceKey(e.target.value)} placeholder="service_key" />
          <Select value={status} onValueChange={(v: ServiceStatus) => setStatus(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
              <SelectItem value="outage">Outage</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between rounded-md border px-3">
            <span className="text-sm">Active</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <Button onClick={handleCreateService} disabled={createService.isPending || !serviceName.trim() || !serviceKey.trim()}>
            {createService.isPending ? "Adding..." : "Add service"}
          </Button>
        </div>
      </Card>
      <DataTable columns={columns} data={services.data ?? []} page={1} total={services.data?.length ?? 0} perPage={services.data?.length || 1} onPageChange={() => undefined} loading={services.isLoading} />
    </div>
  )
}
