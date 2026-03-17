"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useSiteContext } from "@/lib/SiteContext"
import { Plan } from "@/types/plans"
import { CdpPageEvent, useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper"
import { StepCustomerType } from "@/components/checkout/StepCustomerType"
import { StepProperty } from "@/components/checkout/StepProperty"
import { StepPersonalDetails, PersonalDetailsData, MailingAddressData } from "@/components/checkout/StepPersonalDetails"
import { StepBillingPreferences, BillingData } from "@/components/checkout/StepBillingPreferences"
import { StepReview } from "@/components/checkout/StepReview"
import LoginModal from "@/components/LoginModal"
import { MapPin, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const STEP_COUNT = 5

interface CheckoutState {
  customerType: "new" | "existing" | null
  propertyType: "own" | "rent" | null
  personalDetails: PersonalDetailsData
  mailingAddress: MailingAddressData
  billing: BillingData
}

function generateReference(): string {
  return "UP-" + Math.random().toString(36).substring(2, 8).toUpperCase()
}

function CheckoutContent() {
  const t = useTranslations("checkout")
  const tPlans = useTranslations("plans")
  const tStepper = useTranslations("checkout.stepper.steps")
  const searchParams = useSearchParams()
  const { brand, locale, getFullPath } = useSiteContext()
  const { isCDPTrackingEnabled, isLoading: isCDPLoading } = useCDPTracking()
  const { track } = useCdp()

  const planId = searchParams.get("planId")
  const address = searchParams.get("address") || ""
  const planData = tPlans.raw("data") as Record<string, Plan>
  const plan = planId ? planData[planId] ?? null : null

  const [currentStep, setCurrentStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderReference] = useState(generateReference)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string } | null>(null)

  const [state, setState] = useState<CheckoutState>({
    customerType: null,
    propertyType: null,
    personalDetails: { title: "", firstName: "", lastName: "", dob: "", email: "", mobile: "" },
    mailingAddress: { sameAsSupply: true, address: "" },
    billing: { billDelivery: null, correspondence: null },
  })

  const loadLoggedInUser = useCallback(() => {
    const storageKey = `${brand.key}_customer_data`
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}")
    if (data.loginData) {
      const { firstName, lastName, email, phone } = data.loginData
      const name = [firstName, lastName].filter(Boolean).join(" ") || email
      setLoggedInUser({ name, email })
      setState(prev => ({
        ...prev,
        customerType: "existing",
        personalDetails: {
          ...prev.personalDetails,
          firstName: firstName || "",
          lastName: lastName || "",
          email: email || "",
          mobile: phone || "",
        },
      }))
    } else {
      setLoggedInUser(null)
    }
  }, [brand.key])

  useEffect(() => {
    loadLoggedInUser()
    if (planId) {
      const storageKey = `${brand.key}_customer_data`
      const existing = JSON.parse(localStorage.getItem(storageKey) || "{}")
      existing.selectedPlanId = planId
      localStorage.setItem(storageKey, JSON.stringify(existing))
    }
  }, [planId, brand.key, loadLoggedInUser])

  const stepLabels = [
    tStepper("customerType"),
    tStepper("property"),
    tStepper("personalDetails"),
    tStepper("billingPreferences"),
    tStepper("review"),
  ]

  const steps = stepLabels.map((label, i) => ({ number: i + 1, label }))

  const handleCustomerTypeSelect = (type: "new" | "existing") => {
    if (type === "existing" && !loggedInUser) {
      setLoginModalOpen(true)
    }
    setState(prev => ({ ...prev, customerType: type }))
  }

  const handleLogout = () => {
    const storageKey = `${brand.key}_customer_data`
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}")
    delete data.loginData
    localStorage.setItem(storageKey, JSON.stringify(data))
    setLoggedInUser(null)
    setState(prev => ({
      ...prev,
      customerType: null,
      personalDetails: { title: "", firstName: "", lastName: "", dob: "", email: "", mobile: "" },
    }))
  }

  const handleComplete = async () => {
    if (!plan) return
    setIsSubmitting(true)
    if (isCDPTrackingEnabled) {
      track({
        identifier: "plan_convert",
        properties: {
          planId: plan.id,
          planName: plan.name,
          planType: plan.type,
          rate: plan.rate,
          peakRate: plan.peakRate,
          offPeakRate: plan.offPeakRate,
          shoulderRate: plan.shoulderRate,
          dailySupplyCharge: plan.dailySupplyCharge,
          contractTerm: plan.contractTerm,
          discountPercent: plan.discountPercent,
          greenEnergyPercent: plan.greenEnergyPercent,
          supplyAddress: address,
          customerType: state.customerType,
          propertyType: state.propertyType,
          firstName: state.personalDetails.firstName,
          lastName: state.personalDetails.lastName,
          email: state.personalDetails.email,
          mobile: state.personalDetails.mobile,
          dob: state.personalDetails.dob,
          mailingAddressSameAsSupply: state.mailingAddress.sameAsSupply,
          mailingAddress: state.mailingAddress.sameAsSupply ? address : state.mailingAddress.address,
          billDelivery: state.billing.billDelivery,
          correspondence: state.billing.correspondence,
          brand: brand.label,
          locale: locale.code,
          orderReference,
        },
      })
    }
    await new Promise(r => setTimeout(r, 600))
    setIsSubmitting(false)
    setIsComplete(true)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <StepCustomerType
              value={state.customerType}
              loggedInName={loggedInUser?.name}
              onSelect={handleCustomerTypeSelect}
              onLogout={handleLogout}
              onContinue={() => setCurrentStep(2)}
            />
            <LoginModal
              open={loginModalOpen}
              onOpenChange={setLoginModalOpen}
              onLogin={() => {
                setLoginModalOpen(false)
                loadLoggedInUser()
              }}
            />
          </>
        )
      case 2:
        return (
          <StepProperty
            value={state.propertyType}
            onSelect={(v) => setState(prev => ({ ...prev, propertyType: v }))}
            onContinue={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )
      case 3:
        return (
          <StepPersonalDetails
            details={state.personalDetails}
            mailingAddress={state.mailingAddress}
            supplyAddress={address}
            onDetailsChange={(d) => setState(prev => ({ ...prev, personalDetails: d }))}
            onMailingChange={(m) => setState(prev => ({ ...prev, mailingAddress: m }))}
            onContinue={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )
      case 4:
        return (
          <StepBillingPreferences
            data={state.billing}
            onChange={(b) => setState(prev => ({ ...prev, billing: b }))}
            onContinue={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )
      case 5:
        return plan ? (
          <StepReview
            plan={plan}
            supplyAddress={address}
            customerType={state.customerType}
            propertyType={state.propertyType}
            personalDetails={state.personalDetails}
            mailingAddress={state.mailingAddress}
            billing={state.billing}
            onComplete={handleComplete}
            onBack={() => setCurrentStep(4)}
            isSubmitting={isSubmitting}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen">
      {!isCDPLoading && isCDPTrackingEnabled && (
        <CdpPageEvent pageName={t("cdp.pageEventName")} pageProperties={{ brand: brand.label, locale: locale.code }} />
      )}

      <section className="bg-gradient-to-br from-[var(--secondary)] to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-xl text-slate-300">{t("hero.subtitle")}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!plan ? (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600 mb-4">{t("noPlanSelected")}</p>
              <Link href={getFullPath("plans")}>
                <Button className="cursor-pointer">Back to plans</Button>
              </Link>
            </div>
          ) : isComplete ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{t("success.title")}</h2>
              <p className="text-slate-600 mb-4 max-w-sm mx-auto">{t("success.message")}</p>
              <p className="text-sm text-slate-500">
                {t("success.reference")}: <span className="font-mono font-semibold">{orderReference}</span>
              </p>
              <Link href={getFullPath("")} className="mt-6 inline-block">
                <Button variant="outline" className="cursor-pointer">Return home</Button>
              </Link>
            </div>
          ) : (
            <>
              {address && (
                <div className="flex items-center gap-2 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">{t("supplyAddress")}</span>
                    <span className="text-sm font-medium text-slate-700">{address}</span>
                  </div>
                </div>
              )}

              <CheckoutStepper steps={steps} currentStep={currentStep} />

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                {renderStep()}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
