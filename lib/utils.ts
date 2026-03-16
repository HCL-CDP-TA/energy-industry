import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAlternativeEmail(brandKey: string): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(`${brandKey}_alternative_email`) || ""
}

export function trackWithAlternativeEmail(
  track: (event: { identifier: string; properties?: Record<string, unknown> }) => void,
  brandKey: string,
  identifier: string,
  properties?: Record<string, unknown>,
) {
  const alternativeEmail = getAlternativeEmail(brandKey)
  const eventProperties = {
    ...properties,
    alternative_email: alternativeEmail,
  }

  track({
    identifier,
    properties: eventProperties,
  })
}

export function loginWithAlternativeEmail(
  cdpLogin: (loginData: { identifier: string; properties?: Record<string, unknown> }) => void,
  brandKey: string,
  identifier: string,
  properties?: Record<string, unknown>,
) {
  const alternativeEmail = getAlternativeEmail(brandKey)
  const loginProperties = {
    ...properties,
    alternative_email: alternativeEmail,
  }

  cdpLogin({
    identifier,
    properties: loginProperties,
  })
}

export function notifyParentOfUserId(userId: string | null): void {
  try {
    if (window.self === window.top) {
      console.log("[IframeNotification] Not in iframe, skipping postMessage")
      return
    }
  } catch {
    console.log("[IframeNotification] Detected iframe (cross-origin)")
  }

  const message = {
    type: "set-user-id",
    userId: userId,
  }

  console.log("[IframeNotification] Sending to parent:", message)

  window.parent.postMessage(message, "*")
}
