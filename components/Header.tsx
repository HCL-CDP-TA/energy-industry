"use client"

import { useTranslations } from "next-intl"
import { Menu, User, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import LoginModal from "./LoginModal"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import NavLink from "./common/NavLink"
import NavControls from "./NavControls"
import { useSiteContext } from "@/lib/SiteContext"
import { useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { InteractClient, InteractParamType } from "@hcl-cdp-ta/interact-sdk"

const Header = () => {
  const t = useTranslations("navigation")

  const navItems = useTranslations().raw("products") as Array<{ label: string; href: string }>

  const { brand, getFullPath } = useSiteContext()
  const { logout, getSessionData } = useCdp()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [interactClient, setInteractClient] = useState<InteractClient | null>(null)

  useEffect(() => {
    const initInteractClient = async () => {
      try {
        const client = new InteractClient({
          serverUrl: process.env.NEXT_PUBLIC_INTERACT_ENDPOINT ?? "",
          interactiveChannel: "_RealTimePersonalization_",
        })

        const sessionData = getSessionData()
        const cdpSessionId = sessionData && (sessionData as { userSessionId?: string }).userSessionId

        const visitorAudience = InteractClient.createAudience("Visitor", "VisitorID", "0", InteractParamType.Numeric)

        try {
          await client.executeBatch().startSession(visitorAudience, cdpSessionId, {
            parameters: [InteractClient.createParameter("UACIWaitForSegmentation", "true")],
            relyOnExistingSession: true,
            debug: true,
          })
          console.log("Initial visitor session started")
        } catch (error) {
          console.error("Error starting initial visitor session:", error)
        }

        setInteractClient(client)
      } catch (error) {
        console.error("Failed to initialize InteractClient:", error)
      }
    }

    initInteractClient()
  }, [getSessionData])

  const checkLoginStatus = useCallback(() => {
    const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    const wasLoggedIn = isLoggedIn
    const nowLoggedIn = !!customerData?.loginData?.email

    setIsLoggedIn(nowLoggedIn)

    if (!wasLoggedIn && nowLoggedIn && interactClient && customerData?.loginData?.id) {
      console.log("User login detected, starting customer session...")

      const startCustomerSession = async () => {
        try {
          const sessionData = getSessionData()
          const cdpSessionId = sessionData && (sessionData as { userSessionId?: string }).userSessionId

          const audience = InteractClient.createAudience(
            "Customer",
            "CustomerID",
            customerData.loginData.id,
            InteractParamType.Numeric,
          )

          await interactClient.executeBatch().startSession(audience, cdpSessionId, {
            parameters: [InteractClient.createParameter("UACIWaitForSegmentation", "true")],
            relyOnExistingSession: true,
            debug: true,
          })

          console.log("Customer session started automatically")
        } catch (error) {
          console.error("Error starting automatic customer session:", error)
        }
      }

      startCustomerSession()
    }
  }, [brand.key, isLoggedIn, interactClient, getSessionData])

  useEffect(() => {
    checkLoginStatus()

    const handleLoginChange = () => {
      checkLoginStatus()
    }

    window.addEventListener("user-login-changed", handleLoginChange)

    return () => {
      window.removeEventListener("user-login-changed", handleLoginChange)
    }
  }, [brand.key, checkLoginStatus])

  const handleLogout = async () => {
    const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")

    if (customerData?.loginData) {
      delete customerData.loginData
      localStorage.setItem(`${brand.key}_customer_data`, JSON.stringify(customerData))
    }

    setIsLoggedIn(false)

    window.dispatchEvent(new CustomEvent("user-login-changed"))

    logout()
  }

  const handleLogin = async () => {
    checkLoginStatus()

    const customerData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
    if (customerData?.loginData?.id && interactClient) {
      try {
        console.log("Starting Interact session for logged in user...")

        const sessionData = getSessionData()

        await interactClient.setAudience(
          sessionData?.userSessionId ?? "",
          InteractClient.createAudience("Customer", "CustomerID", customerData.loginData.id, InteractParamType.Numeric),
        )

        console.log("Interact session started successfully for customer:", customerData.loginData.id)
      } catch (error) {
        console.error("Error starting Interact session:", error)
      }
    }

    window.dispatchEvent(new CustomEvent("user-login-changed"))
  }

  return (
    <nav className="bg-[var(--secondary)] shadow-sm sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href={getFullPath("/")} className="flex items-center space-x-2">
              <brand.icon className="h-8 w-8 text-[var(--primary)]" />
              <span className="text-2xl font-bold text-[var(--secondary-foreground)]">{brand.label}</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map(item => (
                <NavLink key={item.label} href={getFullPath(item.href)}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavControls />
            {isLoggedIn ? (
              <Button variant="default" className="cursor-pointer" onClick={handleLogout}>
                <User className="h-4 w-4 mr-2 cursor-pointer" />
                {t("logout")}
              </Button>
            ) : (
              <LoginModal onLogin={handleLogin}>
                <Button variant="default" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2 cursor-pointer" />
                  {t("login")}
                </Button>
              </LoginModal>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <NavControls />
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer inline-flex items-center justify-center p-2 rounded-md  focus:outline-none focus:ring-2 focus:ring-inset ">
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </Button>
          </div>
        </div>

        <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={getFullPath(item.href)}
                className="text-[var(--secondary-foreground)] hover:text-[var(--primary)] block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="pt-4">
              {isLoggedIn ? (
                <Button className="w-full pointer-cursor" onClick={handleLogout}>
                  <User className="h-4 w-4 mr-2" />
                  {t("logout")}
                </Button>
              ) : (
                <LoginModal onLogin={handleLogin}>
                  <Button className="w-full pointer-cursor">
                    <User className="h-4 w-4 mr-2" />
                    {t("login")}
                  </Button>
                </LoginModal>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
