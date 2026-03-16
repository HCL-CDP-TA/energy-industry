"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Mail, Phone } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"
import { login, register } from "@/app/actions/LoginRegister"
import { useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"
import { loginWithAlternativeEmail } from "@/lib/utils"

interface LoginModalProps {
  children: React.ReactNode
  onLogin?: () => void
}

export default function LoginModal({ children, onLogin }: LoginModalProps) {
  const t = useTranslations("loginModal")
  const { brand } = useSiteContext()
  const { isCDPTrackingEnabled } = useCDPTracking()
  const { login: cdpLogin } = useCdp()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login({ email: loginData.email, password: loginData.password })

      if (!result?.success) {
        console.error("Login error:", result?.error)
        setError(t(result?.error ?? "errors.userNotFound"))
        return
      }

      const customerData = {
        id: result.data?.id,
        email: result.data?.email,
        firstName: result.data?.firstName || "",
        lastName: result.data?.lastName || "",
        phone: result.data?.phone || "",
        loginTime: new Date().toISOString(),
      }

      const existingData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      localStorage.setItem(`${brand.key}_customer_data`, JSON.stringify({ ...existingData, loginData: customerData }))

      if (isCDPTrackingEnabled) {
        loginWithAlternativeEmail(cdpLogin, brand.key, (customerData.id ?? "").toString())
      }

      setIsOpen(false)

      if (onLogin) {
        onLogin()
      }
      // Dispatch custom event to notify other components about login change
      window.dispatchEvent(new CustomEvent("user-login-changed"))
    } catch (error) {
      console.error("Login error:", error)
      setError(t("errors.genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Uncomment this if you want to enforce password confirmation
      // if (registerData.password !== registerData.confirmPassword) {
      //   setError(t("errors.passwordMismatch"))
      //   setIsLoading(false)
      //   return
      // }

      const result = await register({
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        password: registerData.password,
        phone: registerData.phone,
      })

      if (!result.success) {
        console.error("Registration error:", result.error)
        setError(t(result.error ?? "errors.genericError"))
        return
      }

      const updatedCustomerData = {
        id: result.data?.id,
        email: result.data?.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phone: registerData.phone || "",
        registrationTime: new Date().toISOString(),
      }

      const existingData = JSON.parse(localStorage.getItem(`${brand.key}_customer_data`) || "{}")
      localStorage.setItem(
        `${brand.key}_customer_data`,
        JSON.stringify({ ...existingData, loginData: updatedCustomerData }),
      )

      // Dispatch custom event to notify other components about login change
      window.dispatchEvent(new CustomEvent("user-login-changed"))

      setIsOpen(false)

      if (isCDPTrackingEnabled) {
        loginWithAlternativeEmail(cdpLogin, brand.key, (updatedCustomerData.id ?? "").toString(), {
          firstName: updatedCustomerData.firstName,
          lastName: updatedCustomerData.lastName,
        })
      }

      if (onLogin) {
        onLogin()
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError(t("errors.genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-slate-100 rounded-full w-fit">
            <brand.icon className="h-8 w-8 " />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">{brand.label}</DialogTitle>
          <DialogDescription className="text-slate-600">{t("description")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("tabs.login")}</TabsTrigger>
            <TabsTrigger value="register">{t("tabs.register")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-700">
                  {t("fields.email")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder={t("placeholders.email")}
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="pl-10 border-slate-300"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-slate-700">
                  {t("fields.password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder={t("placeholders.password")}
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="pl-10 border-slate-300"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? t("buttons.signingIn") : t("buttons.signIn")}
              </Button>
            </form>

            <div className="text-center">
              <button className="text-sm hover:underline cursor-pointer">{t("links.forgotPassword")}</button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700">
                    {t("fields.firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder={t("placeholders.firstName")}
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                    className="border-slate-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700">
                    {t("fields.lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder={t("placeholders.lastName")}
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                    className="border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-slate-700">
                  {t("fields.email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder={t("placeholders.email")}
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700">
                  {t("fields.phone")}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t("placeholders.phone")}
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-slate-700">
                  {t("fields.password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder={t("placeholders.password")}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">
                  {t("fields.confirmPassword")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t("placeholders.confirmPassword")}
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    className="pl-10 border-slate-300"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? t("buttons.creatingAccount") : t("buttons.createAccount")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
