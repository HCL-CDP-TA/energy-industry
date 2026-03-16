import { NextIntlClientProvider, hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { getMessages } from "@/lib/getMessages"
import { generateMetadataHelper } from "@/lib/getMetaData"
import { supportedBrands } from "@/i18n/brands"
import { supportedLocales } from "@/i18n/locales"
import type { Metadata } from "next"

export async function generateStaticParams() {
  return supportedBrands.flatMap(brand =>
    supportedLocales.map(locale => ({
      locale: locale.code,
      brand: brand.key,
    })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; locale: string }>
}): Promise<Metadata> {
  const { brand, locale } = await params

  return generateMetadataHelper({
    locale,
    brand,
    slug: [],
  })
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ brand: string; locale: string }>
}) {
  const { brand, locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages(brand, locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-slate-50" data-brand={brand}>
        <Header />
        {children}
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
