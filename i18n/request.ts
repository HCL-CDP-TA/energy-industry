import { getRequestConfig } from "next-intl/server"
import { hasLocale } from "next-intl"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  let messages = {}
  try {
    messages = (await import(`../language/${locale}.json`)).default
  } catch (error) {
    console.log(`No messages found for locale: ${locale}`)
  }

  return {
    locale,
    messages,
  }
})
