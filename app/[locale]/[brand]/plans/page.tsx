"use client"

import { useTranslations } from "next-intl"
import { useSiteContext } from "@/lib/SiteContext"
import { AddressLookup } from "@/components/plans/AddressLookup"
import { PlanGrid } from "@/components/plans/PlanGrid"
import { Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PlansPage() {
  const t = useTranslations("plans")
  const { getFullPath } = useSiteContext()

  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-br from-[var(--secondary)] to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-xl text-slate-300">{t("hero.subtitle")}</p>
        </div>
      </section>

      <AddressLookup />

      <PlanGrid />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Phone className="h-10 w-10 text-[var(--primary)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("help.title")}</h2>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">{t("help.subtitle")}</p>
          <Link href={getFullPath("")}>
            <Button variant="outline" className="cursor-pointer">
              {t("help.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
