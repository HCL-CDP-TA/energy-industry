"use client"

import { useTranslations } from "next-intl"

export default function PlansPage() {
  const t = useTranslations("plans")

  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-br from-[var(--secondary)] to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-xl text-slate-300">{t("hero.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-slate-600 text-center">Plans page content coming in Phase 3.</p>
        </div>
      </section>
    </main>
  )
}
