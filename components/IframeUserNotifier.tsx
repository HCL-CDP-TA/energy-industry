"use client"

import { useEffect } from "react"
import { notifyParentOfUserId } from "@/lib/utils"
import { useSiteContext } from "@/lib/SiteContext"

/**
 * Component that notifies parent window of user login state when running in an iframe
 * Sends user ID on mount and whenever login/logout events occur
 *
 * NOTE: Uses localStorage as the source of truth for login state instead of CDP,
 * because CDP's getIdentityData() may persist userId across page loads even after logout
 */
export default function IframeUserNotifier() {
  const { brand } = useSiteContext()

  useEffect(() => {
    // Function to get current user ID from localStorage and notify parent
    const notifyParent = () => {
      try {
        // Check localStorage for actual login state (source of truth)
        const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
        const isLoggedIn = !!customerData?.loginData?.email

        // Only send userId if user is actually logged in
        const userId = isLoggedIn && customerData?.loginData?.id ? String(customerData.loginData.id) : null

        notifyParentOfUserId(userId)
      } catch (error) {
        console.error("[IframeNotification] Error getting login data:", error)
        notifyParentOfUserId(null)
      }
    }

    // Notify on mount (initial page load)
    notifyParent()

    // Listen for login/logout events
    const handleLoginChange = () => {
      notifyParent()
    }

    window.addEventListener("user-login-changed", handleLoginChange)

    return () => {
      window.removeEventListener("user-login-changed", handleLoginChange)
    }
  }, [brand.key])

  // This component doesn't render anything
  return null
}
