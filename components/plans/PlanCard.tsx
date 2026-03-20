"use client"

import { Plan } from "@/types/plans"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Leaf, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSiteContext } from "@/lib/SiteContext"
import { useTranslations } from "next-intl"
import { useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"

export function PlanCard({ plan, address, onRequestAddress }: { plan: Plan; address: string; onRequestAddress?: () => void }) {
  const { getFullPath } = useSiteContext()
  const t = useTranslations("plans.card")
  const { track } = useCdp()
  const { isCDPTrackingEnabled } = useCDPTracking()
  const addressEntered = !!address

  const typeLabels: Record<string, string> = {
    fixed: t("types.fixed"),
    variable: t("types.variable"),
    tou: t("types.tou"),
    ev: t("types.ev"),
  }

  return (
    <Card className="relative flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-[var(--primary)] text-white border-0">
            {typeLabels[plan.type]}
          </Badge>
          {plan.popular && (
            <Badge variant="secondary">{t("popular")}</Badge>
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="mb-4">
          {plan.rate !== undefined && plan.rate !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-slate-900">{plan.rate}</span>
              <span className="text-slate-500">{plan.unit}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("peak")}</span>
                <span className="font-semibold">{plan.peakRate} {plan.unit}</span>
              </div>
              {plan.shoulderRate !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t("shoulder")}</span>
                  <span className="font-semibold">{plan.shoulderRate} {plan.unit}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("offPeak")}</span>
                <span className="font-semibold">{plan.offPeakRate} {plan.unit}</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-slate-500 mb-4">
          {t("dailySupply")}: {plan.dailySupplyCharge} {plan.dailySupplyChargeUnit}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
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

        <ul className="space-y-2 mb-6 flex-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>

        {addressEntered ? (
          <Link href={getFullPath(`checkout?planId=${plan.id}&address=${encodeURIComponent(address)}`)}>
            <Button
              className="cursor-pointer w-full"
              onClick={() => {
                if (isCDPTrackingEnabled) {
                  const properties: Record<string, unknown> = {
                    plan_id: plan.id,
                    plan_name: plan.name,
                    plan_type: plan.type,
                    daily_supply_charge: plan.dailySupplyCharge,
                  }
                  if (plan.rate !== undefined && plan.rate !== null) {
                    properties.rate = plan.rate
                  } else {
                    properties.peak_rate = plan.peakRate
                    properties.off_peak_rate = plan.offPeakRate
                    if (plan.shoulderRate !== undefined) properties.shoulder_rate = plan.shoulderRate
                  }
                  track({ identifier: "plan_intent", properties })
                }
              }}
            >
              {t("selectPlan")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="w-full cursor-pointer" onClick={onRequestAddress}>
            {t("enterAddress")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
