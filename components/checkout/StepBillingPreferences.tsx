"use client"

import { useTranslations } from "next-intl"
import { Mail, MailOpen } from "lucide-react"
import { OptionCard } from "./OptionCard"
import { Button } from "@/components/ui/button"

export interface BillingData {
  billDelivery: "email" | "post" | null
  correspondence: "email" | "post" | null
}

interface StepBillingPreferencesProps {
  data: BillingData
  onChange: (data: BillingData) => void
  onContinue: () => void
  onBack: () => void
}

export function StepBillingPreferences({ data, onChange, onContinue, onBack }: StepBillingPreferencesProps) {
  const t = useTranslations("checkout.stepBillingPreferences")
  const tNav = useTranslations("checkout.navigation")

  const isComplete = data.billDelivery !== null && data.correspondence !== null

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{t("title")}</h2>
      <p className="text-slate-500 mb-6 text-sm">{t("subtitle")}</p>

      <div className="space-y-6">
        <div>
          <p className="font-medium text-sm text-slate-700 mb-3">{t("billDelivery.label")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OptionCard
              icon={MailOpen}
              title={t("billDelivery.email.title")}
              description={t("billDelivery.email.description")}
              selected={data.billDelivery === "email"}
              onClick={() => onChange({ ...data, billDelivery: "email" })}
            />
            <OptionCard
              icon={Mail}
              title={t("billDelivery.post.title")}
              description={t("billDelivery.post.description")}
              selected={data.billDelivery === "post"}
              onClick={() => onChange({ ...data, billDelivery: "post" })}
            />
          </div>
        </div>

        <div>
          <p className="font-medium text-sm text-slate-700 mb-3">{t("correspondence.label")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OptionCard
              icon={MailOpen}
              title={t("correspondence.email.title")}
              description={t("correspondence.email.description")}
              selected={data.correspondence === "email"}
              onClick={() => onChange({ ...data, correspondence: "email" })}
            />
            <OptionCard
              icon={Mail}
              title={t("correspondence.post.title")}
              description={t("correspondence.post.description")}
              selected={data.correspondence === "post"}
              onClick={() => onChange({ ...data, correspondence: "post" })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="cursor-pointer">
          {tNav("back")}
        </Button>
        <Button onClick={onContinue} disabled={!isComplete} className="cursor-pointer">
          {tNav("continue")}
        </Button>
      </div>
    </div>
  )
}
