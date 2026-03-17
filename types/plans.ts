export interface Plan {
  id: string
  type: "fixed" | "variable" | "tou" | "ev"
  name: string
  rate?: number | null
  peakRate?: number
  shoulderRate?: number
  offPeakRate?: number
  unit: string
  dailySupplyCharge: number
  dailySupplyChargeUnit: string
  contractTerm: number
  discountPercent: number
  greenEnergyPercent: number
  popular: boolean
  features: string[]
}
