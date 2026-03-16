import { defineRouting } from "next-intl/routing"
import { supportedLocales } from "@/i18n/locales"

const localeArray = supportedLocales.map(locale => locale.code)

export const routing = defineRouting({
  locales: localeArray,
  defaultLocale: "en",
  pathnames: {
    "/": "/[locale]/[brand]",
    "/*": "/[locale]/[brand]/*",
  },
})
