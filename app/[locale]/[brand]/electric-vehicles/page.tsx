"use client"

import { useTranslations } from "next-intl"
import { useSiteContext } from "@/lib/SiteContext"
import { Car, Zap, Battery, Plug, Leaf, DollarSign, Wrench, Clock, Sun, ArrowRight, CheckCircle, Quote, Fuel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plan } from "@/types/plans"
import Link from "next/link"
import { CdpPageEvent, useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"
import { useEffect, useRef } from "react"

export default function ElectricVehiclesPage() {
  const t = useTranslations("electricVehicles")
  const tPlans = useTranslations("plans")
  const tPlan = useTranslations("plans.card")
  const { brand, locale, getFullPath } = useSiteContext()
  const { isCDPTrackingEnabled, isLoading: isCDPLoading } = useCDPTracking()
  const { track } = useCdp()
  const hasFiredAcquire = useRef(false)

  useEffect(() => {
    if (!isCDPLoading && isCDPTrackingEnabled && !hasFiredAcquire.current) {
      hasFiredAcquire.current = true
      track({ identifier: "ev_acquire" })
    }
  }, [isCDPLoading, isCDPTrackingEnabled, track])

  const planOrder = tPlans.raw("planOrder") as string[]
  const planData = tPlans.raw("data") as Record<string, Plan>
  const evPlans = planOrder.map(id => planData[id]).filter(p => p?.type === "ev")

  const statIcons = [DollarSign, Clock, Zap, Leaf]
  const stepIcons = [Zap, Plug, Clock, Car]
  const benefitIcons = [DollarSign, Leaf, Wrench, Battery, DollarSign, Sun]
  const chargingIcons = [Plug, Wrench, Sun]

  return (
    <main>
      {!isCDPLoading && isCDPTrackingEnabled && (
        <CdpPageEvent pageName={t("cdp.pageEventName")} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}

      {/* Hero */}
      <section className="relative text-white py-20 md:py-32 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${t("hero.heroImage")}')` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <Link href={getFullPath("plans")}>
              <Button size="lg" className="cursor-pointer text-lg px-8 py-6">
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[0, 1, 2, 3].map(i => {
              const Icon = statIcons[i]
              return (
                <div key={i} className="flex flex-col items-center">
                  <Icon className="h-10 w-10 text-[var(--primary)] mb-3" />
                  <p className="text-3xl font-bold text-slate-900">{t(`stats.items.${i}.value`)}</p>
                  <p className="text-sm text-slate-600 mt-1">{t(`stats.items.${i}.label`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* EV Plans */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("plans.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("plans.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {evPlans.map(plan => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow border-0 shadow-md relative flex flex-col">
                <CardHeader className="pb-4">
                  {plan.popular && (
                    <Badge className="absolute top-4 right-4 bg-[var(--primary)]">
                      {tPlan("popular")}
                    </Badge>
                  )}
                  <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="h-7 w-7 text-[var(--primary)]" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-sm text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">{tPlan("offPeak")}: </span>
                    <span className="text-2xl font-bold text-slate-900">{plan.offPeakRate}</span>
                    <span className="text-slate-500 ml-1">{plan.unit}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="text-sm text-slate-600 space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={getFullPath(`plans?plan=ev`)}>
                    <Button variant="outline" className="cursor-pointer w-full">
                      {t("plans.viewCta")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Home Charging */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("charging.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("charging.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map(i => {
              const Icon = chargingIcons[i]
              return (
                <div key={i} className="bg-slate-50 rounded-xl p-8">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(`charging.features.${i}.title`)}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{t(`charging.features.${i}.description`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("howItWorks.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("howItWorks.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  {t(`howItWorks.steps.${i}.step`)}
                </div>
                <h3 className="text-lg font-semibold mb-2">{t(`howItWorks.steps.${i}.title`)}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{t(`howItWorks.steps.${i}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("benefits.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("benefits.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map(i => {
              const Icon = benefitIcons[i]
              return (
                <div key={i} className="bg-slate-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="font-semibold mb-2">{t(`benefits.items.${i}.title`)}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{t(`benefits.items.${i}.description`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-16 bg-gradient-to-br from-[var(--secondary)] to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("comparison.title")}</h2>
          <p className="text-lg text-slate-300 text-center mb-12 max-w-2xl mx-auto">{t("comparison.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-semibold mb-2">{t("comparison.ev.label")}</h3>
              <p className="text-3xl font-bold mb-1">{t("comparison.ev.cost")}</p>
              <p className="text-slate-300 text-sm mb-4">{t("comparison.ev.annualLabel")}</p>
              <p className="text-2xl font-bold text-green-400">{t("comparison.ev.annual")}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center">
              <Fuel className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold mb-2">{t("comparison.petrol.label")}</h3>
              <p className="text-3xl font-bold mb-1">{t("comparison.petrol.cost")}</p>
              <p className="text-slate-300 text-sm mb-4">{t("comparison.petrol.annualLabel")}</p>
              <p className="text-2xl font-bold text-slate-400">{t("comparison.petrol.annual")}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 text-center mt-6">{t("comparison.note")}</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("testimonials.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("testimonials.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map(i => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-[var(--primary)]/30 mb-4" />
                  <p className="text-slate-700 leading-relaxed mb-6 italic">
                    &ldquo;{t(`testimonials.items.${i}.quote`)}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-slate-900">{t(`testimonials.items.${i}.name`)}</p>
                    <p className="text-sm text-slate-500">{t(`testimonials.items.${i}.location`)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--primary)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">{t("cta.subtitle")}</p>
          <Link href={getFullPath("plans")}>
            <Button size="lg" variant="outline" className="cursor-pointer text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-slate-900">
              {t("cta.button")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
