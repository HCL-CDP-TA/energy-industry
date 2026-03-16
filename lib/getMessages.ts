import fs from "fs/promises"
import path from "path"
import { supportedLocales } from "@/i18n/locales"
import { supportedBrands } from "@/i18n/brands"
import deepmerge from "deepmerge"

async function loadJson(filePath: string): Promise<Record<string, unknown>> {
  try {
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export async function getMessages(brand: string, locale: string) {
  const defaultLocale = supportedLocales[0].code
  const defaultBrand = supportedBrands[0].key

  const localeConfig =
    supportedLocales.find(l => l.code === locale) || supportedLocales.find(l => l.code === defaultLocale)

  if (!localeConfig) {
    throw new Error(`Locale configuration not found for locale: ${locale}`)
  }

  const selectedBrand = supportedBrands.find(supportedBrand => supportedBrand.key === brand)?.key || defaultBrand

  const fallbackChain = Array.from(new Set([localeConfig.code, ...(localeConfig.fallbacks || [])])).filter(
    fallbackLocale => fallbackLocale !== defaultLocale,
  )

  const baseTranslations = await loadJson(path.resolve(process.cwd(), `language/${defaultLocale}.json`))

  const localeTranslations = await Promise.all(
    fallbackChain.reverse().map(async fallbackLocale => {
      const filePath = path.resolve(process.cwd(), `language/${fallbackLocale}.json`)
      const translations = await loadJson(filePath)
      return translations
    }),
  )

  const brandTranslations = await Promise.all(
    [defaultLocale, ...fallbackChain].map(async fallbackLocale => {
      const filePath = path.resolve(process.cwd(), `language/${selectedBrand}/${fallbackLocale}.json`)
      const translations = await loadJson(filePath)
      return translations
    }),
  )

  const mergedTranslations = deepmerge.all([baseTranslations, ...localeTranslations, ...brandTranslations], {
    arrayMerge: (destinationArray, sourceArray) => sourceArray,
  })

  return mergedTranslations
}
