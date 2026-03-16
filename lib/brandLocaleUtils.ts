import * as Icons from "lucide-react"
import { supportedBrands, type SupportedBrand } from "@/i18n/brands"
import { supportedLocales, type SupportedLocale } from "@/i18n/locales"

export const resolvePathContext = (pathname: string): { locale: SupportedLocale; brand: SupportedBrand } => {
  const [, locale, brand] = pathname.split("/")
  const matchedBrand = supportedBrands.find(b => b.key === brand) || supportedBrands[0]
  const matchedLocale = supportedLocales.find(l => l.code === locale) || supportedLocales[0]
  return { locale: matchedLocale, brand: matchedBrand }
}

export const getIcon = (name: string): Icons.LucideIcon => {
  return (Icons[name as keyof typeof Icons] as Icons.LucideIcon) || Icons.Shield
}
