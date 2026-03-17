"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plan } from "@/types/plans"
import { PersonalDetailsData, MailingAddressData } from "./StepPersonalDetails"
import { BillingData } from "./StepBillingPreferences"

interface StepReviewProps {
  plan: Plan
  supplyAddress: string
  customerType: "new" | "existing" | null
  propertyType: "own" | "rent" | null
  personalDetails: PersonalDetailsData
  mailingAddress: MailingAddressData
  billing: BillingData
  onComplete: () => void
  onBack: () => void
  isSubmitting: boolean
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 mb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  )
}

export function StepReview({
  plan,
  supplyAddress,
  customerType,
  propertyType,
  personalDetails,
  mailingAddress,
  billing,
  onComplete,
  onBack,
  isSubmitting,
}: StepReviewProps) {
  const t = useTranslations("checkout.stepReview")
  const tNav = useTranslations("checkout.navigation")
  const tPlan = useTranslations("checkout")

  const planTypeLabel = tPlan(`planTypes.${plan.type}`)

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{t("title")}</h2>
      <p className="text-slate-500 mb-6 text-sm">{t("subtitle")}</p>

      <ReviewSection title={t("sections.plan")}>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-[var(--primary)] text-white border-0 text-xs">{planTypeLabel}</Badge>
        </div>
        <p className="font-semibold text-slate-800">{plan.name}</p>
        {plan.rate !== null ? (
          <p className="text-sm text-slate-500 mt-0.5">{plan.rate} {plan.unit}</p>
        ) : (
          <p className="text-sm text-slate-500 mt-0.5">
            Peak: {plan.peakRate} / Off-peak: {plan.offPeakRate} {plan.unit}
          </p>
        )}
      </ReviewSection>

      {supplyAddress && (
        <ReviewSection title={t("sections.supplyAddress")}>
          <p className="text-sm text-slate-700">{supplyAddress}</p>
        </ReviewSection>
      )}

      <ReviewSection title={t("sections.customerType") + " & " + t("sections.property")}>
        <ReviewRow
          label={t("sections.customerType")}
          value={customerType === "new" ? t("values.new") : t("values.existing")}
        />
        <ReviewRow
          label={t("sections.property")}
          value={propertyType === "own" ? t("values.own") : t("values.rent")}
        />
      </ReviewSection>

      <ReviewSection title={t("sections.personalDetails")}>
        <ReviewRow
          label="Name"
          value={[personalDetails.title, personalDetails.firstName, personalDetails.lastName].filter(Boolean).join(" ")}
        />
        <ReviewRow label="Date of birth" value={personalDetails.dob} />
        <ReviewRow label="Email" value={personalDetails.email} />
        <ReviewRow label="Mobile" value={personalDetails.mobile} />
        <ReviewRow
          label={t("sections.mailingAddress")}
          value={mailingAddress.sameAsSupply ? t("values.sameAsSupply") : mailingAddress.address}
        />
      </ReviewSection>

      <ReviewSection title={t("sections.billing")}>
        <ReviewRow
          label={t("billDelivery")}
          value={billing.billDelivery === "email" ? t("values.email") : t("values.post")}
        />
        <ReviewRow
          label={t("correspondence")}
          value={billing.correspondence === "email" ? t("values.email") : t("values.post")}
        />
      </ReviewSection>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="cursor-pointer" disabled={isSubmitting}>
          {tNav("back")}
        </Button>
        <Button onClick={onComplete} className="cursor-pointer" disabled={isSubmitting}>
          {isSubmitting ? "Completing..." : tNav("completeOrder")}
        </Button>
      </div>
    </div>
  )
}
