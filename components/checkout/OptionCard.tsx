"use client"

import { LucideIcon } from "lucide-react"

interface OptionCardProps {
  icon?: LucideIcon
  title: string
  description?: string
  selected: boolean
  onClick: () => void
}

export function OptionCard({ icon: Icon, title, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-5 rounded-lg border-2 transition-all cursor-pointer ${
        selected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon
            className={`h-5 w-5 mt-0.5 shrink-0 ${selected ? "text-[var(--primary)]" : "text-slate-400"}`}
          />
        )}
        <div>
          <p className={`font-medium ${selected ? "text-[var(--primary)]" : "text-slate-800"}`}>{title}</p>
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
    </button>
  )
}
