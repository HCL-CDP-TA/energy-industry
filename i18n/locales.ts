export interface SupportedLocale {
  code: string
  label: string
  fallbacks: string[]
  visible?: boolean
}

const supportedLocales: SupportedLocale[] = [
  { code: "en", label: "English", fallbacks: [], visible: false },
  { code: "en-US", label: "English (US)", fallbacks: ["en"], visible: true },
  { code: "en-GB", label: "English (UK)", fallbacks: ["en"], visible: true },
  { code: "en-AU", label: "English (AU)", fallbacks: ["en"], visible: true },
  { code: "en-CA", label: "English (Canada)", fallbacks: ["en"], visible: true },
  { code: "en-IN", label: "English (India)", fallbacks: ["en"], visible: true },
  { code: "fr", label: "Français", fallbacks: ["en"], visible: true },
  { code: "fr-CA", label: "Français (Canada)", fallbacks: ["fr", "en"], visible: true },
  { code: "es", label: "Español", fallbacks: ["en"], visible: true },
  { code: "de", label: "Deutsch", fallbacks: ["en"], visible: true },
  { code: "it-IT", label: "Italiano", fallbacks: ["en"], visible: true },
  { code: "sv-SE", label: "Svenska", fallbacks: ["en"], visible: true },
]

export { supportedLocales }
