"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"

const PLAN_TYPES = ["all", "fixed", "variable", "tou", "ev"] as const

export function PlanFilters({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string
  onFilterChange: (filter: string) => void
}) {
  const t = useTranslations("plans.filters")

  return (
    <Tabs value={activeFilter} onValueChange={onFilterChange}>
      <TabsList className="flex-wrap h-auto gap-1">
        {PLAN_TYPES.map(type => (
          <TabsTrigger key={type} value={type} className="px-4 py-2">
            {t(type)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
