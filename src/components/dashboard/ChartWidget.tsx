import type { ReactNode } from "react"
import { Card } from "@/components/dashboard/Card"

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
}

export function ChartWidget({ title, subtitle, children, action }: Props) {
  return (
    <Card title={title} description={subtitle} action={action}>
      <div className="h-[300px] w-full">{children}</div>
    </Card>
  )
}
