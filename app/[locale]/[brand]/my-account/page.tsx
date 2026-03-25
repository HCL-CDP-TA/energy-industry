"use client"

import { useTranslations } from "next-intl"
import { useSiteContext } from "@/lib/SiteContext"
import {
  Zap,
  BarChart3,
  Receipt,
  FileText,
  CreditCard,
  Settings,
  TrendingDown,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CdpPageEvent } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"
import { useState, useEffect } from "react"

function formatAccountDates(localeCode: string) {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat(localeCode, { day: "numeric", month: "long", year: "numeric" })
  const pastThe15th = now.getDate() >= 15
  return {
    lastPaymentDate: fmt.format(new Date(now.getFullYear(), pastThe15th ? now.getMonth() : now.getMonth() - 1, 15)),
    nextBillDate: fmt.format(new Date(now.getFullYear(), pastThe15th ? now.getMonth() + 1 : now.getMonth(), 15)),
    contractEndDate: fmt.format(new Date(now.getFullYear() + 1, now.getMonth(), 15)),
  }
}

export default function MyAccountPage() {
  const t = useTranslations("myAccount")
  const { brand, locale, getFullPath } = useSiteContext()
  const { isCDPTrackingEnabled, isLoading: isCDPLoading } = useCDPTracking()

  const { lastPaymentDate, nextBillDate, contractEndDate } = formatAccountDates(locale.code)

  const [firstName, setFirstName] = useState<string | null>(null)
  useEffect(() => {
    const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    setFirstName(customerData?.loginData?.firstName ?? null)
  }, [brand.key])

  const usageIcons = [Zap, BarChart3, TrendingDown, Receipt]
  const quickLinkIcons = [BarChart3, FileText, CreditCard, Settings]

  return (
    <main>
      {!isCDPLoading && isCDPTrackingEnabled && (
        <CdpPageEvent pageName={t("cdp.pageEventName")} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}

      {/* Hero */}
      <section
        id="hero-section"
        className="relative text-white py-20 md:py-32 bg-cover bg-center"
        style={{ backgroundImage: `url('${t("hero.heroImage")}')` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {firstName ? `${t("hero.title")}, ${firstName}` : t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">{t("hero.subtitle")}</p>
          </div>
        </div>
      </section>

      {/* Plan + Billing */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Plan */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t("plan.title")}</CardTitle>
                  <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{t("plan.name")}</p>
                  <p className="text-sm text-slate-500">{t("plan.type")}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{t("plan.rateLabel")}</p>
                    <p className="font-semibold text-slate-900">{t("plan.rate")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{t("plan.supplyChargeLabel")}</p>
                    <p className="font-semibold text-slate-900">{t("plan.dailySupplyCharge")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{t("plan.contractEndLabel")}</p>
                    <p className="font-semibold text-slate-900">{contractEndDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{t("plan.greenEnergyLabel")}</p>
                    <p className="font-semibold text-slate-900">{t("plan.greenEnergy")}</p>
                  </div>
                </div>
                <Link href={getFullPath("plans")}>
                  <Button variant="outline" size="sm" className="cursor-pointer mt-2">
                    {t("plan.changePlan")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Billing Summary */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t("billing.title")}</CardTitle>
                  <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{t("billing.nextBillDueLabel")}</p>
                    <p className="font-semibold text-slate-900">{nextBillDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      {t("billing.estimatedAmountLabel")}
                    </p>
                    <p className="font-semibold text-slate-900">{t("billing.estimatedAmount")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{t("billing.lastPaymentLabel")}</p>
                    <p className="font-semibold text-slate-900">{t("billing.lastPaymentAmount")} on {lastPaymentDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{t("billing.paymentMethodLabel")}</p>
                    <p className="font-semibold text-slate-900">{t("billing.paymentMethod")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Usage Overview */}
      <section className="py-12 bg-slate-50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-2">{t("usage.title")}</h2>
          <p className="text-slate-600 mb-8">{t("usage.subtitle")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map(i => {
              const Icon = usageIcons[i]
              return (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <Icon className="h-8 w-8 text-[var(--primary)] mx-auto mb-3" />
                  <p className="text-2xl font-bold text-slate-900">{t(`usage.items.${i}.value`)}</p>
                  <p className="text-sm text-slate-500 mt-1">{t(`usage.items.${i}.label`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-2">{t("quickLinks.title")}</h2>
          <p className="text-slate-600 mb-8">{t("quickLinks.subtitle")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map(i => {
              const Icon = quickLinkIcons[i]
              return (
                <Link key={i} href="#">
                  <Card className="h-full hover:shadow-md transition-shadow border border-slate-200 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[var(--primary)]/20 transition-colors">
                        <Icon className="h-6 w-6 text-[var(--primary)]" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center justify-between">
                        {t(`quickLinks.items.${i}.title`)}
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[var(--primary)] transition-colors" />
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{t(`quickLinks.items.${i}.description`)}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
