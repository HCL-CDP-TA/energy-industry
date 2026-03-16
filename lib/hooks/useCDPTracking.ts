import { useTrackingType } from "./useTrackingType"

export const useCDPTracking = () => {
  const { trackingType, isLoading } = useTrackingType()

  const isCDPTrackingEnabled = !isLoading && trackingType === "cdp"

  return {
    isCDPTrackingEnabled,
    isLoading,
  }
}
