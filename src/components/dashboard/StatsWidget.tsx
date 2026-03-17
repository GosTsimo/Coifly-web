import { TrendingDown, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/dashboard/Card"

interface Props {
  label: string
  value: string
  icon: LucideIcon
  delta?: number
}

export function StatsWidget({ label, value, icon: Icon, delta }: Props) {
  const trendPositive = typeof delta === "number" ? delta >= 0 : null

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.18),transparent_55%)]" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          {typeof delta === "number" ? (
            <p className="mt-2 flex items-center gap-1 text-xs">
              {trendPositive ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-rose-500" />}
              <span className={trendPositive ? "text-emerald-500" : "text-rose-500"}>{Math.abs(delta)}%</span>
              <span className="text-muted-foreground">vs yesterday</span>
            </p>
          ) : null}
        </div>
        <div className="bg-primary/10 rounded-lg p-2">
          <Icon className="text-primary h-4 w-4" />
        </div>
      </div>
    </Card>
  )
}
