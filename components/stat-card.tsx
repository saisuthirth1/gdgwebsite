import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: ReactNode
  positive?: boolean
  negative?: boolean
}

export function StatCard({ title, value, description, icon, positive, negative }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className={cn(positive && "text-green-500", negative && "text-red-500")}>
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

