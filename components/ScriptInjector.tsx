"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { useTrackingType } from "@/lib/hooks/useTrackingType"

export default function ScriptInjector() {
  const { trackingType } = useTrackingType()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render anything during SSR
  if (!isMounted) {
    return null
  }

  // Only render Discover script if tracking type is "discover"
  if (trackingType !== "discover") {
    return null
  }

  // Get script URL from override or environment variable
  const overrideScript = localStorage.getItem("discover_script_override")
  const defaultScript = process.env.NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT
  const scriptUrl = overrideScript || defaultScript

  // Show warning if no URL configured
  if (!scriptUrl) {
    console.warn(
      "Discover script is enabled but no URL configured.",
      "Environment variable NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT:",
      process.env.NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT,
      "Override from localStorage:",
      localStorage.getItem("discover_script_override"),
    )
    return null
  }

  return (
    <Script
      src={scriptUrl}
      strategy="afterInteractive"
      onError={() => {
        console.error(`Failed to load discover script: ${scriptUrl}`)
      }}
    />
  )
}
