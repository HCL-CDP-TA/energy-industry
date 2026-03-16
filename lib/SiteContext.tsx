"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SupportedBrand, supportedBrands } from "@/i18n/brands"
import { SupportedLocale, supportedLocales } from "@/i18n/locales"

interface SiteContextType {
  brand: SupportedBrand
  locale: SupportedLocale
  setBrand: (brandKey: string) => void
  setLocale: (localeCode: string) => void
  basePath: string
  getFullPath: (path: string) => string
  getPageNamespace: () => string
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [brand, setBrandState] = useState<SupportedBrand>(supportedBrands[0])
  const [locale, setLocaleState] = useState<SupportedLocale>(supportedLocales[0])

  useEffect(() => {
    const [, localeCode, brandKey] = pathname.split("/")
    const matchedBrand = supportedBrands.find(b => b.key === brandKey)
    const matchedLocale = supportedLocales.find(l => l.code === localeCode)

    if (matchedBrand) setBrandState(matchedBrand)
    if (matchedLocale) setLocaleState(matchedLocale)
  }, [pathname])

  const setBrand = (brandKey: string) => {
    const [, localeCode, , ...rest] = pathname.split("/")
    const newPath = `/${localeCode}/${brandKey}${rest.length ? "/" + rest.join("/") : ""}`
    router.push(newPath)
  }

  const setLocale = (localeCode: string) => {
    const [, , brandKey, ...rest] = pathname.split("/")
    const newPath = `/${localeCode}/${brandKey}${rest.length ? "/" + rest.join("/") : ""}`
    router.push(newPath)
  }

  const basePath = `/${locale.code}/${brand.key}`

  const getFullPath = (path: string) => {
    if (!path) return basePath
    return `${basePath}/${path.replace(/^\/+/, "")}`
  }

  const getPageNamespace = () => {
    const [, , , ...rest] = pathname.split("/")
    return rest.join("/") || "home"
  }

  return (
    <SiteContext.Provider
      value={{
        brand,
        locale,
        setBrand,
        setLocale,
        basePath,
        getFullPath,
        getPageNamespace,
      }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSiteContext() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error("useSiteContext must be used within a SiteProvider")
  }
  return context
}
