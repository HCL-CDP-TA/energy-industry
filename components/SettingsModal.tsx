"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings, User, UserCog, FileText, Copy } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"
import { useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { format } from "date-fns"

interface SettingsModalProps {
  children: React.ReactNode
}

interface UpdatedSessionData {
  userSessionId?: string
  deviceSessionId?: string
  lastActivityTimestamp?: number
  sessionStartTimestamp?: number
  [key: string]: unknown
}

export default function SettingsModal({ children }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { brand } = useSiteContext()
  const {
    setSessionLogging: cdpSetSessionLogging,
    setUserLogoutLogging: cdpSetUserLogoutLogging,
    setInactivityTimeout: cdpSetInactivityTimeout,
    getIdentityData,
    getSessionData,
    getConfig,
  } = useCdp()

  const [settings, setSettings] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    userId: "",
    alternativeEmail: "",
  })

  const [cdpData, setCdpData] = useState({
    userId: "",
    deviceId: "",
    sessionId: "",
    profileId: "",
    lastActivityTimestamp: "",
    sessionStartTimestamp: "",
  })

  const [writekeyOverride, setWritekeyOverride] = useState("")
  const [envWritekey, setEnvWritekey] = useState("")
  const [scriptOverride, setScriptOverride] = useState("")
  const [envScript, setEnvScript] = useState("")

  const [sessionLogging, setSessionLogging] = useState(false)
  const [userLogoutLogging, setUserLogoutLogging] = useState(false)
  const [inactivityTimeout, setInactivityTimeout] = useState("30")
  const [, setCdpConfig] = useState<
    | (Record<string, unknown> & {
        runtimeSettings?: {
          sessionLogging: boolean
          userLogoutLogging: boolean
          inactivityTimeout: number
          lastUpdated: string
        }
      })
    | null
  >(null)

  const refreshCdpData = useCallback(() => {
    const identityData = getIdentityData()
    const sessionData = getSessionData()
    const baseConfig = getConfig()

    setCdpData({
      userId: identityData?.userId || "Not logged in",
      deviceId: identityData?.deviceId || "Not available",
      sessionId: (sessionData as unknown as UpdatedSessionData)?.userSessionId || "Not available",
      profileId: identityData?.profileId || "Not available",
      lastActivityTimestamp: (sessionData as unknown as UpdatedSessionData)?.lastActivityTimestamp
        ? format(new Date((sessionData as unknown as UpdatedSessionData).lastActivityTimestamp!), "PPpp")
        : "Not available",
      sessionStartTimestamp: (sessionData as unknown as UpdatedSessionData)?.sessionStartTimestamp
        ? format(new Date((sessionData as unknown as UpdatedSessionData).sessionStartTimestamp!), "PPpp")
        : "Not available",
    })

    const enhancedConfig = {
      ...baseConfig,
      runtimeSettings: {
        sessionLogging: sessionLogging,
        userLogoutLogging: userLogoutLogging,
        inactivityTimeout: parseInt(inactivityTimeout, 10),
        lastUpdated: new Date().toISOString(),
      },
    }

    setCdpConfig(enhancedConfig)
  }, [getIdentityData, getSessionData, getConfig, sessionLogging, userLogoutLogging, inactivityTimeout, setCdpConfig])

  useEffect(() => {
    const storedCustomerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    if (storedCustomerData?.loginData) {
      setSettings(prev => ({
        ...prev,
        firstName: storedCustomerData.loginData.firstName || "",
        lastName: storedCustomerData.loginData.lastName || "",
        email: storedCustomerData.loginData.email || "",
        phone: storedCustomerData.loginData.phone || "",
        userId: storedCustomerData.loginData.id?.toString() || "",
      }))
    }

    const storedAlternativeEmail = localStorage.getItem(`${brand.key}_alternative_email`) || ""
    setSettings(prev => ({
      ...prev,
      alternativeEmail: storedAlternativeEmail,
    }))
  }, [brand.key])

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedCustomerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      if (updatedCustomerData?.loginData) {
        setSettings(prev => ({
          ...prev,
          firstName: updatedCustomerData.loginData.firstName || "",
          lastName: updatedCustomerData.loginData.lastName || "",
          email: updatedCustomerData.loginData.email || "",
          phone: updatedCustomerData.loginData.phone || "",
          userId: updatedCustomerData.loginData.id?.toString() || "",
        }))
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [brand.key])

  useEffect(() => {
    const identityData = getIdentityData()
    const sessionData = getSessionData()
    const baseConfig = getConfig()

    setCdpData({
      userId: identityData?.userId || "Not logged in",
      deviceId: identityData?.deviceId || "Not available",
      sessionId: (sessionData as unknown as UpdatedSessionData)?.userSessionId || "Not available",
      profileId: identityData?.profileId || "Not available",
      lastActivityTimestamp: (sessionData as unknown as UpdatedSessionData)?.lastActivityTimestamp
        ? format(new Date((sessionData as unknown as UpdatedSessionData).lastActivityTimestamp!), "PPpp")
        : "Not available",
      sessionStartTimestamp: (sessionData as unknown as UpdatedSessionData)?.sessionStartTimestamp
        ? format(new Date((sessionData as unknown as UpdatedSessionData).sessionStartTimestamp!), "PPpp")
        : "Not available",
    })

    const enhancedConfig = {
      ...baseConfig,
      runtimeSettings: {
        sessionLogging: sessionLogging,
        userLogoutLogging: userLogoutLogging,
        inactivityTimeout: parseInt(inactivityTimeout, 10),
        lastUpdated: new Date().toISOString(),
      },
    }

    setCdpConfig(enhancedConfig)
  }, [
    brand.key,
    getIdentityData,
    getSessionData,
    getConfig,
    sessionLogging,
    userLogoutLogging,
    inactivityTimeout,
    setCdpConfig,
  ])

  useEffect(() => {
    if (isOpen) {
      const cookieName = `${brand.key}_cdp_writekey_override`
      const cookieValue = document.cookie
        .split("; ")
        .find(row => row.startsWith(`${cookieName}=`))
        ?.split("=")[1]

      const storedOverride = cookieValue ? decodeURIComponent(cookieValue) : ""
      setWritekeyOverride(storedOverride)
      setEnvWritekey(process.env.NEXT_PUBLIC_CDP_WRITEKEY || "Not configured")

      const scriptOverrideValue = localStorage.getItem("discover_script_override") || ""
      setScriptOverride(scriptOverrideValue)
      setEnvScript(process.env.NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT || "Not configured")

      const baseConfig = getConfig()

      const savedSessionLogging = localStorage.getItem("cdp_session_logging")
      const savedUserLogoutLogging = localStorage.getItem("cdp_user_logout_logging")
      const savedInactivityTimeout = localStorage.getItem("cdp_inactivity_timeout")

      const sessionLoggingValue =
        savedSessionLogging !== null ? savedSessionLogging === "true" : baseConfig?.enableSessionLogging ?? false

      const userLogoutLoggingValue =
        savedUserLogoutLogging !== null
          ? savedUserLogoutLogging === "true"
          : baseConfig?.enableUserLogoutLogging ?? false

      const inactivityTimeoutValue =
        savedInactivityTimeout !== null ? savedInactivityTimeout : baseConfig?.inactivityTimeout?.toString() ?? "30"

      setSessionLogging(sessionLoggingValue)
      setUserLogoutLogging(userLogoutLoggingValue)
      setInactivityTimeout(inactivityTimeoutValue)

      cdpSetSessionLogging(sessionLoggingValue)
      cdpSetUserLogoutLogging(userLogoutLoggingValue)
      const timeoutMinutes = parseInt(inactivityTimeoutValue, 10)
      if (!isNaN(timeoutMinutes) && timeoutMinutes > 0) {
        cdpSetInactivityTimeout(timeoutMinutes)
      }

      setTimeout(() => {
        refreshCdpData()
      }, 0)
    }
  }, [
    isOpen,
    brand.key,
    cdpSetSessionLogging,
    cdpSetUserLogoutLogging,
    cdpSetInactivityTimeout,
    getConfig,
    refreshCdpData,
  ])

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))

    if (key === "alternativeEmail") {
      localStorage.setItem(`${brand.key}_alternative_email`, value as string)
    }
  }

  const handleSessionLoggingChange = (checked: boolean) => {
    setSessionLogging(checked)
    localStorage.setItem("cdp_session_logging", checked.toString())
    cdpSetSessionLogging(checked)
    refreshCdpData()
  }

  const handleUserLogoutLoggingChange = (checked: boolean) => {
    setUserLogoutLogging(checked)
    localStorage.setItem("cdp_user_logout_logging", checked.toString())
    cdpSetUserLogoutLogging(checked)
    refreshCdpData()
  }

  const handleInactivityTimeoutChange = (value: string) => {
    setInactivityTimeout(value)
    localStorage.setItem("cdp_inactivity_timeout", value)
    const timeoutMinutes = parseInt(value, 10)
    if (!isNaN(timeoutMinutes) && timeoutMinutes > 0) {
      cdpSetInactivityTimeout(timeoutMinutes)
    }
    refreshCdpData()
  }

  const handleCopyUserId = async () => {
    if (settings.userId) {
      try {
        await navigator.clipboard.writeText(settings.userId)
      } catch (err) {
        console.error("Failed to copy user ID:", err)
        const textArea = document.createElement("textarea")
        textArea.value = settings.userId
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
    }
  }

  const clearCdpData = () => {
    localStorage.removeItem("hclcdp_identity_data")
    sessionStorage.removeItem("hclcdp_session")

    setCdpData({
      userId: "Not logged in",
      deviceId: "Not available",
      sessionId: "Not available",
      profileId: "Not available",
      lastActivityTimestamp: "Not available",
      sessionStartTimestamp: "Not available",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] h-[90vh] sm:h-[70vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Settings className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">Account Settings</DialogTitle>
              <DialogDescription className="text-slate-600">
                Manage your energy account preferences and settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="profile" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center gap-2 cursor-pointer">
                <UserCog className="h-4 w-4" />
                CDP Settings
              </TabsTrigger>
              <TabsTrigger value="script" className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Discover Script
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-6">
              <TabsContent value="profile" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your personal details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={settings.firstName}
                          onChange={e => handleSettingChange("firstName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={settings.lastName}
                          onChange={e => handleSettingChange("lastName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.email}
                          onChange={e => handleSettingChange("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userId">User ID</Label>
                        <div className="relative">
                          <Input
                            id="userId"
                            value={settings.userId}
                            readOnly
                            className="bg-slate-50 cursor-not-allowed pr-10"
                            placeholder="Not available"
                          />
                          {settings.userId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCopyUserId}
                              className="absolute right-1 top-1 h-8 w-8 hover:bg-slate-200 transition-colors"
                              title="Copy user ID to clipboard">
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={e => handleSettingChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternativeEmail">Alternative Email Address</Label>
                      <Input
                        id="alternativeEmail"
                        type="email"
                        value={settings.alternativeEmail}
                        onChange={e => handleSettingChange("alternativeEmail", e.target.value)}
                        placeholder="Optional email for special communications"
                      />
                      <p className="text-xs text-slate-500">
                        This email may be included in some events and communications. Leave empty if not needed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="demo" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      CDP Configuration
                      {writekeyOverride && <Badge variant="outline">Override Active</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Writekey Configuration</h4>
                      <div className="space-y-2">
                        <Label>Current Environment Writekey</Label>
                        <p className="text-sm text-slate-600 font-mono bg-slate-50 p-2 rounded border break-all">
                          {envWritekey}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="writekey-override">Writekey Override</Label>
                        <Input
                          id="writekey-override"
                          type="text"
                          placeholder="Enter writekey to override environment setting"
                          value={writekeyOverride}
                          onChange={e => setWritekeyOverride(e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-slate-500">
                          Leave empty to use the environment writekey. Override takes effect after page refresh.
                        </p>
                      </div>
                      {writekeyOverride && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-100">
                              Active Override
                            </Badge>
                            <span className="text-sm text-yellow-800">Using custom writekey</span>
                          </div>
                          <p className="text-xs text-yellow-700 mt-1 font-mono break-all">{writekeyOverride}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const cookieName = `${brand.key}_cdp_writekey_override`
                            const cookieValue = encodeURIComponent(writekeyOverride)
                            const expiryDate = new Date()
                            expiryDate.setFullYear(expiryDate.getFullYear() + 1)
                            document.cookie = `${cookieName}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/`
                          }}
                          className="cursor-pointer">
                          Save Override
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setWritekeyOverride("")
                            const cookieName = `${brand.key}_cdp_writekey_override`
                            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
                          }}
                          className="cursor-pointer">
                          Clear Override
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            window.location.reload()
                          }}
                          className="cursor-pointer">
                          Refresh Page
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">CDP Settings</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="session-logging">Session Logging</Label>
                            <div className="text-sm text-muted-foreground">
                              Send Session_Start and Session_End events to CDP
                            </div>
                          </div>
                          <Switch
                            id="session-logging"
                            checked={sessionLogging}
                            onCheckedChange={handleSessionLoggingChange}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="logout-logging">User Logout Logging</Label>
                            <div className="text-sm text-muted-foreground">
                              Capture a Logout event to the CDP when the user logs out
                            </div>
                          </div>
                          <Switch
                            id="logout-logging"
                            checked={userLogoutLogging}
                            onCheckedChange={handleUserLogoutLoggingChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="inactivity-timeout">Session Timeout (minutes)</Label>
                          <Input
                            id="inactivity-timeout"
                            type="number"
                            min="1"
                            max="120"
                            value={inactivityTimeout}
                            onChange={e => handleInactivityTimeoutChange(e.target.value)}
                            className="w-32"
                          />
                          <div className="text-sm text-muted-foreground">
                            Time before the session ends due to inactivity. Set to 0 for no timeout. This does not
                            affect the user&apos;s login.
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      CDP SDK Data
                    </CardTitle>
                    <CardDescription>Live data from the HCL CDP SDK</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Active Writekey</Label>
                      <p className="text-sm text-slate-600 font-mono bg-slate-50 p-2 rounded border break-all">
                        {writekeyOverride || envWritekey}
                        {writekeyOverride && (
                          <Badge className="ml-2" variant="outline">
                            Override
                          </Badge>
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>User ID</Label>
                      <p className="text-sm text-slate-600">{cdpData.userId}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Profile ID</Label>
                      <p className="text-sm text-slate-600">{cdpData.profileId}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Device ID</Label>
                      <p className="text-sm text-slate-600">{cdpData.deviceId}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Session ID</Label>
                      <p className="text-sm text-slate-600">{cdpData.sessionId}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Last Activity Timestamp</Label>
                      <p className="text-sm text-slate-600">{cdpData.lastActivityTimestamp}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Session Start Timestamp</Label>
                      <p className="text-sm text-slate-600">{cdpData.sessionStartTimestamp}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={refreshCdpData} className="cursor-pointer">
                        Refresh Data
                      </Button>
                      <Button variant="outline" onClick={clearCdpData} className="cursor-pointer">
                        Clear CDP SDK Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="script" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Discover Script Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />

                    <div className="space-y-2">
                      <Label>Environment Script URL</Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-mono text-gray-700 break-all">{envScript}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Set via NEXT_PUBLIC_DISCOVER_DEFAULT_SCRIPT environment variable
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="script-override">Script URL Override</Label>
                      <Input
                        id="script-override"
                        value={scriptOverride}
                        onChange={e => setScriptOverride(e.target.value)}
                        placeholder="eg https://example.com/custom-discover.js"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Override the environment script URL with a custom one (optional)
                      </p>
                      {scriptOverride && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-yellow-100">
                              Active Override
                            </Badge>
                            <span className="text-sm text-yellow-800">Using custom script URL</span>
                          </div>
                          <p className="text-xs text-yellow-700 mt-1 font-mono break-all">{scriptOverride}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            localStorage.setItem("discover_script_override", scriptOverride)
                            window.location.reload()
                          }}
                          className="cursor-pointer">
                          Save Override
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setScriptOverride("")
                            localStorage.removeItem("discover_script_override")
                            window.location.reload()
                          }}
                          className="cursor-pointer">
                          Clear Override
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-between pt-6 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
