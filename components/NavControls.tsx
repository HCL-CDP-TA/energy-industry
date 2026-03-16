"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BriefcaseBusiness, Globe, Settings } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"
import { supportedLocales } from "@/i18n/locales"
import { supportedBrands } from "@/i18n/brands"
import { useTranslations } from "next-intl"
import SettingsModal from "./SettingsModal"

export default function NavControls() {
  const t = useTranslations("navigation")

  const { brand, locale, setBrand, setLocale } = useSiteContext()

  const switchLocale = (newLocale: string) => {
    setLocale(newLocale)
  }

  const switchBrand = (newBrand: string) => {
    setBrand(newBrand)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer hover:bg-primary-foreground"
            title={t("themeTooltip")}>
            <BriefcaseBusiness className="h-8 w-8 text-[var(--primary)] hover:text-primary-foreground " />
            <span className="sr-only">{t("themeTooltip")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white">
          <DropdownMenuLabel>{t("themeHeader")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {supportedBrands.map(brandOption => {
            return (
              <DropdownMenuItem
                key={brandOption.key}
                onClick={() => switchBrand(brandOption.key)}
                className={`cursor-pointer p-2 group ${
                  brand.key === brandOption.key
                    ? "bg-accent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                    : "hover:bg-primary hover:text-primary-foreground"
                }`}>
                <brandOption.icon
                  className={`mr-2 h-4 w-4 ${
                    brand.key === brandOption.key
                      ? "text-primary-foreground"
                      : "text-current group-hover:text-primary-foreground"
                  }`}
                />
                {brandOption.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Locale Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer hover:bg-primary-foreground"
            title={t("localeTooltip")}>
            <Globe className="h-8 w-8 text-[var(--primary)] " />
            <span className="sr-only">{t("localeTooltip")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-white ">
          <DropdownMenuLabel>{t("localeHeader")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {supportedLocales
            .filter(locale => locale.visible)
            .map(supportedLocale => (
              <DropdownMenuItem
                key={supportedLocale.code}
                onClick={() => switchLocale(supportedLocale.code)}
                className={`cursor-pointer p-2 group ${
                  locale.code === supportedLocale.code
                    ? "bg-accent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                    : "hover:bg-primary hover:text-primary-foreground"
                }`}>
                {supportedLocale.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings */}
      <SettingsModal>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 cursor-pointer hover:bg-primary-foreground"
          title={t("settings")}>
          <Settings className="h-8 w-8 text-[var(--primary)]" />
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </SettingsModal>
    </div>
  )
}
