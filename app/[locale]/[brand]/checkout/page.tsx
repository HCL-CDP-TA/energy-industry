"use client"

import { Suspense } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useSiteContext } from "@/lib/SiteContext"
import plans from "@/data/plans.json"
import { Plan } from "@/types/plans"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Leaf } from "lucide-react"
import { useEffect } from "react"
import { CdpPageEvent } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"

function CheckoutContent() {
  const t = useTranslations("checkout")
  const searchParams = useSearchParams()
  const { brand, locale } = useSiteContext()
  const { isCDPTrackingEnabled, isLoading: isCDPLoading } = useCDPTracking()
  const planId = searchParams.get("planId")
  const plan = (plans as Plan[]).find(p => p.id === planId)

  useEffect(() => {
    if (planId) {
      const storageKey = `${brand.key}_customer_data`
      const existing = JSON.parse(localStorage.getItem(storageKey) || "{}")
      existing.selectedPlanId = planId
      localStorage.setItem(storageKey, JSON.stringify(existing))
    }
  }, [planId, brand.key])

  const typeLabels: Record<string, string> = {
    fixed: t("planTypes.fixed"),
    variable: t("planTypes.variable"),
    tou: t("planTypes.tou"),
    ev: t("planTypes.ev"),
  }

  return (
    <main className="min-h-screen">
      {!isCDPLoading && isCDPTrackingEnabled && (
        <CdpPageEvent pageName={t("cdp.pageEventName")} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}

      <section className="bg-gradient-to-br from-[var(--secondary)] to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-xl text-slate-300">{t("hero.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {plan ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">{t("selectedPlan")}</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-[var(--primary)] text-white border-0">
                      {typeLabels[plan.type]}
                    </Badge>
                    {plan.popular && (
                      <Badge variant="secondary">{t("popular")}</Badge>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {plan.rate !== null ? (
                      <div>
                        <span className="text-sm text-slate-500">{t("rate")}</span>
                        <p className="text-xl font-bold">{plan.rate} {plan.unit}</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="text-sm text-slate-500">{t("peakRate")}</span>
                          <p className="text-lg font-bold">{plan.peakRate} {plan.unit}</p>
                        </div>
                        {plan.shoulderRate !== undefined && (
                          <div>
                            <span className="text-sm text-slate-500">{t("shoulderRate")}</span>
                            <p className="text-lg font-bold">{plan.shoulderRate} {plan.unit}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-slate-500">{t("offPeakRate")}</span>
                          <p className="text-lg font-bold">{plan.offPeakRate} {plan.unit}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-sm text-slate-500">{t("dailySupply")}</span>
                      <p className="text-lg font-bold">{plan.dailySupplyCharge} {plan.dailySupplyChargeUnit}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    {plan.contractTerm > 0 ? (
                      <span className="text-sm text-slate-600">{plan.contractTerm} {t("monthContract")}</span>
                    ) : (
                      <span className="text-sm text-green-700 font-medium">{t("noLockIn")}</span>
                    )}
                    {plan.discountPercent > 0 && (
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        {plan.discountPercent}% {t("discount")}
                      </Badge>
                    )}
                  </div>

                  {plan.greenEnergyPercent > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-green-700 mb-4">
                      <Leaf className="h-4 w-4" />
                      {plan.greenEnergyPercent}% {t("greenEnergy")}
                    </div>
                  )}

                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <p className="text-lg text-slate-600 text-center mt-8">{t("comingSoon")}</p>
            </div>
          ) : (
            <p className="text-lg text-slate-600 text-center">{t("noPlanSelected")}</p>
          )}
        </div>
      </section>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
