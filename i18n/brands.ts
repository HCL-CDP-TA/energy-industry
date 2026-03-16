import { Zap, Flame } from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface SupportedBrand {
  key: string
  label: string
  icon: LucideIcon
}

const supportedBrands: SupportedBrand[] = [
  { key: "unipower", label: "UniPower", icon: Zap },
  { key: "energyaustralia", label: "EnergyAustralia", icon: Flame },
]

export { supportedBrands }
