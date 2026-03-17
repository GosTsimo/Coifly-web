import { useMemo, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Send } from "lucide-react"
import { ActionDropdown } from "@/components/dashboard/ActionDropdown"
import { Card } from "@/components/dashboard/Card"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable } from "@/components/tables/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAssignTicket, useCloseTicket, useEscalateTicket, useReplyTicket, useTickets } from "@/lib/hooks/useAdminQueries"
import type { Ticket } from "@/lib/types/admin"

const PAGE_SIZE = 8

export default function TicketsPage() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState("")

  const ticketsQuery = useTickets({ page, per_page: PAGE_SIZE })
  const assign = useAssignTicket()
  const escalate = useEscalateTicket()
  const close = useCloseTicket()
  const sendReply = useReplyTicket()

  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      { accessorKey: "id", header: "Ticket ID" },
      { accessorFn: (row) => row.user.name, id: "user", header: "User" },
      { accessorKey: "urgency", header: "Urgency", cell: ({ row }) => <StatusBadge status={row.original.urgency} /> },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionDropdown
            actions={[
              { label: "View conversation", onClick: () => setSelected(row.original) },
              { label: "Assign admin", onClick: () => assign.mutate({ ticketId: row.original.id, admin_user_id: 3 }) },
              { label: "Escalate", onClick: () => escalate.mutate(row.original.id) },
              { label: "Close", onClick: () => close.mutate(row.original.id) },
            ]}
          />
        ),
      },
    ],
    [assign, close, escalate]
  )

  return (
    <div>
      <PageHeader title="Support Tickets" description="Handle conversations, assignments and escalation workflows." />
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <DataTable
          columns={columns}
          data={ticketsQuery.data?.data ?? []}
          page={ticketsQuery.data?.current_page ?? page}
          total={ticketsQuery.data?.total ?? 0}
          perPage={PAGE_SIZE}
          onPageChange={setPage}
          loading={ticketsQuery.isLoading}
        />

        <Card title="Ticket conversation" description={selected ? `Ticket #${selected.id} - ${selected.subject}` : "Select a ticket"}>
          {!selected ? (
            <p className="text-muted-foreground text-sm">Choose a ticket from the table to read and reply.</p>
          ) : (
            <div className="space-y-3">
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
                {selected.messages.map((m) => (
                  <div key={m.id} className="space-y-1">
                    <p className="text-xs font-medium">{m.sender.name}</p>
                    <p className="text-sm">{m.message}</p>
                  </div>
                ))}
              </div>
              <Input placeholder="Assign admin id" defaultValue="3" />
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write reply..." rows={4} />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!reply.trim()) return
                    sendReply.mutate({ ticketId: selected.id, message: reply })
                    setReply("")
                  }}
                >
                  <Send className="mr-2 h-4 w-4" /> Reply
                </Button>
                <Button variant="outline" onClick={() => escalate.mutate(selected.id)}>Escalate</Button>
                <Button variant="outline" onClick={() => close.mutate(selected.id)}>Close</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
