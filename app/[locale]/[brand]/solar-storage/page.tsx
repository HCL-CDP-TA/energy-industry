"use client"

import { useTranslations } from "next-intl"
import { useSiteContext } from "@/lib/SiteContext"
import { Sun, Battery, Package, Wrench, Compass, Zap, ArrowRight, CheckCircle, Leaf, Home, DollarSign, Shield, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { CdpPageEvent } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"

export default function SolarStoragePage() {
  const t = useTranslations("solarStorage")
  const { brand, locale, getFullPath } = useSiteContext()
  const { isCDPTrackingEnabled, isLoading: isCDPLoading } = useCDPTracking()

  const statIcons = [DollarSign, Shield, Zap, Wrench]
  const solutionIcons = [Sun, Battery, Package]
  const stepIcons = [Compass, Wrench, Zap, Sun]
  const benefitIcons = [DollarSign, Zap, Leaf, Shield, Home, DollarSign]

  return (
    <main>
      {!isCDPLoading && isCDPTrackingEnabled && (
        <CdpPageEvent pageName={t("cdp.pageEventName")} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}

      {/* Hero */}
      <section id="hero-section" className="relative text-white py-20 md:py-32 bg-cover bg-center" style={{ backgroundImage: `url('${t("hero.heroImage")}')` }}>
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

      {/* Solutions */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("solutions.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("solutions.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map(i => {
              const Icon = solutionIcons[i]
              return (
                <Card key={i} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-[var(--primary)]" />
                    </div>
                    <CardTitle className="text-xl">{t(`solutions.cards.${i}.title`)}</CardTitle>
                    <CardDescription className="leading-relaxed">{t(`solutions.cards.${i}.description`)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-slate-600 space-y-2">
                      {[0, 1, 2].map(j => (
                        <li key={j} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          {t(`solutions.cards.${i}.features.${j}`)}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
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
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("benefits.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("benefits.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map(i => {
              const Icon = benefitIcons[i]
              return (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
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

      {/* Feed-in Tariff */}
      <section className="py-16 bg-gradient-to-br from-[var(--secondary)] to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t("feedIn.title")}</h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">{t("feedIn.subtitle")}</p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
                <p className="text-sm text-slate-300">{t("feedIn.rate")}</p>
                <p className="text-4xl font-bold">{t("feedIn.rateValue")}</p>
                <p className="text-sm text-slate-400 mt-1">{t("feedIn.rateNote")}</p>
              </div>
            </div>
            <div>
              <ul className="space-y-4">
                {[0, 1, 2, 3].map(i => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{t(`feedIn.features.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
