import { Card } from "@/components/dashboard/Card"
import { PageHeader } from "@/components/dashboard/PageHeader"

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Workspace settings, permissions and system preferences." />
      <Card title="Admin settings" description="Modular settings surface ready for policy, RBAC and notifications modules.">
        <p className="text-muted-foreground text-sm">
          Add sections for role-based access control, notification channels, API keys and audit retention rules.
        </p>
      </Card>
    </div>
  )
}
