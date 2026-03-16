"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTrackingType } from "@/lib/hooks/useTrackingType"
import { useSiteContext } from "@/lib/SiteContext"
import { ChevronDown, Info, User, Copy } from "lucide-react"
import packageJson from "../package.json"

export default function StatusPopover() {
  const [isMinimized, setIsMinimized] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    userId?: string
  } | null>(null)
  const { trackingType, setTrackingType } = useTrackingType()
  const { brand } = useSiteContext()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const updateUserData = () => {
      const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      if (customerData?.loginData) {
        setCurrentUser({
          firstName: customerData.loginData.firstName,
          lastName: customerData.loginData.lastName,
          email: customerData.loginData.email,
          userId: customerData.loginData.id?.toString(),
        })
      } else {
        setCurrentUser(null)
      }
    }

    // Initial load
    updateUserData()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${brand.key}_customer_data`) {
        updateUserData()
      }
    }

    // Listen for login/logout events
    const handleLoginChange = () => {
      updateUserData()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("user-login-changed", handleLoginChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("user-login-changed", handleLoginChange)
    }
  }, [isMounted, brand.key])

  // Handle tracking toggle
  const handleTrackingToggle = (type: "cdp" | "discover") => {
    setTrackingType(type)
  }

  // Handle copying email to clipboard
  const handleCopyEmail = async () => {
    if (currentUser?.email) {
      try {
        await navigator.clipboard.writeText(currentUser.email)
        // You could add a toast notification here if you have one
        console.log("Email copied to clipboard:", currentUser.email)
      } catch (err) {
        console.error("Failed to copy email:", err)
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = currentUser.email
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
    }
  }

  // Handle copying user ID to clipboard
  const handleCopyUserId = async () => {
    if (currentUser?.userId) {
      try {
        await navigator.clipboard.writeText(currentUser.userId)
        // You could add a toast notification here if you have one
        console.log("User ID copied to clipboard:", currentUser.userId)
      } catch (err) {
        console.error("Failed to copy user ID:", err)
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = currentUser.userId
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
    }
  }

  // Don't render during SSR
  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        // Minimized state - just an icon
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMinimized(false)}
          className="h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 cursor-pointer"
          title="Show current status information">
          <Info className="h-5 w-5" />
        </Button>
      ) : (
        // Expanded state - full popover
        <Card className="w-80 shadow-xl border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Current Status</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 rounded-full cursor-pointer"
                title="Minimize">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Version */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <Badge variant="outline" className="font-mono text-xs">
                v{packageJson.version}
              </Badge>
            </div>

            {/* Current User */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User</span>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Not logged in"}
                  </span>
                </div>
              </div>
              {currentUser?.email && (
                <div className="flex items-center justify-between pl-4">
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]" title={currentUser.email}>
                    {currentUser.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyEmail}
                    className="h-6 w-6 ml-2 flex-shrink-0 hover:bg-slate-200 transition-colors"
                    title="Copy email to clipboard">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {currentUser?.userId && (
                <div className="flex items-center justify-between pl-4">
                  <span className="text-xs text-muted-foreground">User ID: {currentUser.userId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyUserId}
                    className="h-6 w-6 ml-2 flex-shrink-0 hover:bg-slate-200 transition-colors"
                    title="Copy user ID to clipboard">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Tracking Type Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tracking</span>
              <div className="flex gap-2">
                <Button
                  variant={trackingType === "cdp" ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => handleTrackingToggle("cdp")}>
                  CDP
                </Button>
                <Button
                  variant={trackingType === "discover" ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => handleTrackingToggle("discover")}>
                  Discover
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
