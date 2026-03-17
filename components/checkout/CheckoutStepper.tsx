"use client"

interface Step {
  number: number
  label: string
}

interface CheckoutStepperProps {
  steps: Step[]
  currentStep: number
}

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((step, index) => {
        const isComplete = step.number < currentStep
        const isActive = step.number === currentStep
        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  isComplete
                    ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                    : isActive
                    ? "border-[var(--primary)] text-[var(--primary)] bg-white"
                    : "border-slate-300 text-slate-400 bg-white"
                }`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-1.5 text-xs text-center max-w-[70px] leading-tight hidden sm:block ${
                  isActive ? "text-[var(--primary)] font-medium" : isComplete ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                  isComplete ? "bg-[var(--primary)]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
