import type { ReactNode } from "react"
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Props {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, description, action, children, className }: Props) {
  return (
    <UiCard className={cn("border-border/70 bg-card/95", className)}>
      {(title || description || action) && (
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              {title ? <CardTitle className="text-base font-semibold">{title}</CardTitle> : null}
              {description ? <p className="text-muted-foreground mt-1 text-xs">{description}</p> : null}
            </div>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </UiCard>
  )
}
