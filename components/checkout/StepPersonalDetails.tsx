"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddressAutocomplete } from "./AddressAutocomplete"

export interface PersonalDetailsData {
  title: string
  firstName: string
  lastName: string
  dob: string
  email: string
  mobile: string
}

export interface MailingAddressData {
  sameAsSupply: boolean
  address: string
}

interface StepPersonalDetailsProps {
  details: PersonalDetailsData
  mailingAddress: MailingAddressData
  supplyAddress: string
  onDetailsChange: (details: PersonalDetailsData) => void
  onMailingChange: (mailing: MailingAddressData) => void
  onContinue: () => void
  onBack: () => void
}

function isComplete(details: PersonalDetailsData, mailing: MailingAddressData): boolean {
  return !!(
    details.firstName &&
    details.lastName &&
    details.dob &&
    details.email &&
    details.mobile &&
    (mailing.sameAsSupply || mailing.address)
  )
}

export function StepPersonalDetails({
  details,
  mailingAddress,
  supplyAddress,
  onDetailsChange,
  onMailingChange,
  onContinue,
  onBack,
}: StepPersonalDetailsProps) {
  const t = useTranslations("checkout.stepPersonalDetails")
  const tNav = useTranslations("checkout.navigation")
  const titles = t.raw("titles") as string[]

  const handleChange = (field: keyof PersonalDetailsData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onDetailsChange({ ...details, [field]: e.target.value })
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">{t("title")}</h2>
      <p className="text-slate-500 mb-6 text-sm">{t("subtitle")}</p>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t("title_field")}</Label>
            <select
              id="title"
              value={details.title}
              onChange={handleChange("title")}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <option value="" />
              {titles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-3 space-y-1.5">
            <Label htmlFor="firstName">{t("firstName")}</Label>
            <Input
              id="firstName"
              value={details.firstName}
              onChange={handleChange("firstName")}
              placeholder={t("placeholders.firstName")}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName">{t("lastName")}</Label>
          <Input
            id="lastName"
            value={details.lastName}
            onChange={handleChange("lastName")}
            placeholder={t("placeholders.lastName")}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dob">{t("dob")}</Label>
          <Input
            id="dob"
            type="date"
            value={details.dob}
            onChange={handleChange("dob")}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={details.email}
            onChange={handleChange("email")}
            placeholder={t("placeholders.email")}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mobile">{t("mobile")}</Label>
          <Input
            id="mobile"
            type="tel"
            value={details.mobile}
            onChange={handleChange("mobile")}
            placeholder={t("placeholders.mobile")}
            required
          />
        </div>

        <div className="pt-2">
          <p className="font-medium text-sm text-slate-700 mb-3">{t("mailingAddress.heading")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => onMailingChange({ ...mailingAddress, sameAsSupply: true })}
              className={`p-3 rounded-lg border-2 text-sm text-left cursor-pointer transition-all ${
                mailingAddress.sameAsSupply
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] font-medium"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {t("mailingAddress.sameLabel")}
            </button>
            <button
              type="button"
              onClick={() => onMailingChange({ ...mailingAddress, sameAsSupply: false })}
              className={`p-3 rounded-lg border-2 text-sm text-left cursor-pointer transition-all ${
                !mailingAddress.sameAsSupply
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] font-medium"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {t("mailingAddress.differentLabel")}
            </button>
          </div>
          {!mailingAddress.sameAsSupply && (
            <AddressAutocomplete
              onAddressChange={(addr) => onMailingChange({ ...mailingAddress, address: addr })}
              placeholder={t("mailingAddress.placeholder")}
              initialValue={mailingAddress.address}
            />
          )}
          {mailingAddress.sameAsSupply && supplyAddress && (
            <p className="text-sm text-slate-500 mt-1">{supplyAddress}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="cursor-pointer">
          {tNav("back")}
        </Button>
        <Button
          onClick={onContinue}
          disabled={!isComplete(details, mailingAddress)}
          className="cursor-pointer"
        >
          {tNav("continue")}
        </Button>
      </div>
    </div>
  )
}
