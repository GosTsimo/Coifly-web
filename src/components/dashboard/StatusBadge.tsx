import { Badge } from "@/components/ui/badge"
import type { AccountStatus, BookingStatus, ModerationStatus, ServiceStatus, TicketStatus, Urgency } from "@/lib/types/admin"

type AnyStatus = AccountStatus | BookingStatus | ModerationStatus | ServiceStatus | TicketStatus | Urgency

const statusMap: Record<string, string> = {
  active: "bg-emerald-600 text-white",
  approved: "bg-emerald-600 text-white",
  operational: "bg-emerald-600 text-white",
  completed: "bg-emerald-600 text-white",
  confirmed: "bg-emerald-600 text-white",
  open: "bg-sky-600 text-white",
  pending: "bg-amber-500 text-black",
  medium: "bg-amber-500 text-black",
  suspended: "bg-amber-600 text-black",
  degraded: "bg-amber-600 text-black",
  low: "bg-slate-500 text-white",
  inactive: "bg-slate-600 text-white",
  resolved: "bg-slate-600 text-white",
  no_show: "bg-orange-700 text-white",
  cancelled: "bg-orange-700 text-white",
  refused: "bg-rose-600 text-white",
  banned: "bg-rose-700 text-white",
  outage: "bg-rose-700 text-white",
  critical: "bg-red-700 text-white",
  high: "bg-orange-600 text-white",
}

export function StatusBadge({ status }: { status: AnyStatus | string | undefined }) {
  if (!status) {
    return <Badge className="bg-muted text-muted-foreground">Unknown</Badge>
  }
  const className = statusMap[status] ?? "bg-muted text-muted-foreground"
  return <Badge className={className}>{String(status).replace("_", " ")}</Badge>
}
