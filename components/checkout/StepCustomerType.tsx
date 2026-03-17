"use client"

import { useTranslations } from "next-intl"
import { UserPlus, User } from "lucide-react"
import { OptionCard } from "./OptionCard"
import { Button } from "@/components/ui/button"

interface StepCustomerTypeProps {
  value: "new" | "existing" | null
  loggedInName?: string
  onSelect: (type: "new" | "existing") => void
  onLogout: () => void
  onContinue: () => void
}

export function StepCustomerType({ value, loggedInName, onSelect, onLogout, onContinue }: StepCustomerTypeProps) {
  const t = useTranslations("checkout.stepCustomerType")
  const tNav = useTranslations("checkout.navigation")

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{t("title")}</h2>
      <p className="text-slate-500 mb-6 text-sm">{t("subtitle")}</p>

      {loggedInName ? (
        <div className="p-4 rounded-lg border-2 border-[var(--primary)] bg-[var(--primary)]/5 mb-6">
          <p className="text-sm text-slate-600">{t("loggedInAs")}</p>
          <p className="font-semibold text-slate-800">{loggedInName}</p>
          <button
            type="button"
            onClick={onLogout}
            className="text-sm text-[var(--primary)] underline mt-1 cursor-pointer"
          >
            {t("notYou")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <OptionCard
            icon={UserPlus}
            title={t("new.title")}
            description={t("new.description")}
            selected={value === "new"}
            onClick={() => onSelect("new")}
          />
          <OptionCard
            icon={User}
            title={t("existing.title")}
            description={t("existing.description")}
            selected={value === "existing"}
            onClick={() => onSelect("existing")}
          />
        </div>
      )}

      <Button
        onClick={onContinue}
        disabled={!value && !loggedInName}
        className="cursor-pointer"
      >
        {tNav("continue")}
      </Button>
    </div>
  )
}
