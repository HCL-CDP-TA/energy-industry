"use client"

import { useTranslations } from "next-intl"
import { useSiteContext } from "@/lib/SiteContext"
import { Zap, Shield, Leaf, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function HomePage() {
  const t = useTranslations("home")
  const { brand, getFullPath } = useSiteContext()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkLoginStatus = () => {
      const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      setIsLoggedIn(!!customerData?.loginData?.email)
    }

    checkLoginStatus()

    const handleLoginChange = () => {
      checkLoginStatus()
    }

    window.addEventListener("user-login-changed", handleLoginChange)
    return () => {
      window.removeEventListener("user-login-changed", handleLoginChange)
    }
  }, [brand.key])

  const trustIcons = [Zap, Shield, Leaf, Users]

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--secondary)] to-slate-800 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={getFullPath("plans")}>
                <Button size="lg" className="cursor-pointer text-lg px-8 py-6">
                  {t("hero.cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {!isLoggedIn && (
                <Link href={getFullPath("plans")}>
                  <Button size="lg" variant="outline" className="cursor-pointer text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-slate-900">
                    {t("hero.secondaryCta")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Numbers */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[0, 1, 2, 3].map(i => {
              const Icon = trustIcons[i]
              return (
                <div key={i} className="flex flex-col items-center">
                  <Icon className="h-10 w-10 text-[var(--primary)] mb-3" />
                  <p className="text-3xl font-bold text-slate-900">{t(`trustNumbers.items.${i}.value`)}</p>
                  <p className="text-sm text-slate-600 mt-1">{t(`trustNumbers.items.${i}.label`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("products.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("products.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map(i => (
              <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-6">
                    {i === 0 && <Zap className="h-7 w-7 text-[var(--primary)]" />}
                    {i === 1 && <Leaf className="h-7 w-7 text-[var(--primary)]" />}
                    {i === 2 && <Shield className="h-7 w-7 text-[var(--primary)]" />}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t(`products.cards.${i}.title`)}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{t(`products.cards.${i}.description`)}</p>
                  <Link href={getFullPath(t(`products.cards.${i}.href`))}>
                    <Button variant="outline" className="cursor-pointer w-full">
                      {t(`products.cards.${i}.cta`)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">{t("whyChoose.title")}</h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">{t("whyChoose.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map(i => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {i === 0 && <Zap className="h-8 w-8 text-[var(--primary)]" />}
                  {i === 1 && <Leaf className="h-8 w-8 text-[var(--primary)]" />}
                  {i === 2 && <Users className="h-8 w-8 text-[var(--primary)]" />}
                </div>
                <h3 className="text-xl font-semibold mb-2">{t(`whyChoose.items.${i}.title`)}</h3>
                <p className="text-slate-600 leading-relaxed">{t(`whyChoose.items.${i}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--primary)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">{t("cta.subtitle")}</p>
          <Link href={getFullPath("plans")}>
            <Button size="lg" variant="outline" className="cursor-pointer text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-slate-900">
              {t("cta.button")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
