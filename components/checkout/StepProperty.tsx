"use client"

import { useTranslations } from "next-intl"
import { Home, Key } from "lucide-react"
import { OptionCard } from "./OptionCard"
import { Button } from "@/components/ui/button"

interface StepPropertyProps {
  value: "own" | "rent" | null
  onSelect: (type: "own" | "rent") => void
  onContinue: () => void
  onBack: () => void
}

export function StepProperty({ value, onSelect, onContinue, onBack }: StepPropertyProps) {
  const t = useTranslations("checkout.stepProperty")
  const tNav = useTranslations("checkout.navigation")

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{t("title")}</h2>
      <p className="text-slate-500 mb-6 text-sm">{t("subtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <OptionCard
          icon={Home}
          title={t("own.title")}
          description={t("own.description")}
          selected={value === "own"}
          onClick={() => onSelect("own")}
        />
        <OptionCard
          icon={Key}
          title={t("rent.title")}
          description={t("rent.description")}
          selected={value === "rent"}
          onClick={() => onSelect("rent")}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="cursor-pointer">
          {tNav("back")}
        </Button>
        <Button onClick={onContinue} disabled={!value} className="cursor-pointer">
          {tNav("continue")}
        </Button>
      </div>
    </div>
  )
}
