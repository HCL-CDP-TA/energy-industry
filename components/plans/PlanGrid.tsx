"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Plan } from "@/types/plans"
import { PlanCard } from "./PlanCard"
import { PlanFilters } from "./PlanFilters"

const VALID_FILTERS = ["all", "fixed", "variable", "tou", "ev"]

export function PlanGrid({ address }: { address: string }) {
  const searchParams = useSearchParams()
  const planParam = searchParams.get("plan") ?? ""
  const initialFilter = VALID_FILTERS.includes(planParam) ? planParam : "all"
  const [activeFilter, setActiveFilter] = useState(initialFilter)
  const t = useTranslations("plans")

  const planOrder = t.raw("planOrder") as string[]
  const planData = t.raw("data") as Record<string, Plan>
  const allPlans = planOrder.map(id => planData[id])

  const filteredPlans = activeFilter === "all"
    ? allPlans
    : allPlans.filter(p => p.type === activeFilter)

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">{t("grid.title")}</h2>
        <p className="text-lg text-slate-600 text-center mb-8 max-w-2xl mx-auto">{t("grid.subtitle")}</p>

        <div className="flex justify-center mb-8">
          <PlanFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} address={address} />
          ))}
        </div>
      </div>
    </section>
  )
}
