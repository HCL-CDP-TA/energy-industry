"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import plans from "@/data/plans.json"
import { Plan } from "@/types/plans"
import { PlanCard } from "./PlanCard"
import { PlanFilters } from "./PlanFilters"

export function PlanGrid({ address }: { address: string }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const t = useTranslations("plans.grid")

  const filteredPlans = activeFilter === "all"
    ? (plans as Plan[])
    : (plans as Plan[]).filter(p => p.type === activeFilter)

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">{t("title")}</h2>
        <p className="text-lg text-slate-600 text-center mb-8 max-w-2xl mx-auto">{t("subtitle")}</p>

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
