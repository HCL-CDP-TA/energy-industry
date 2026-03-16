import "./globals.css"
import { Inter } from "next/font/google"
import { SiteProvider } from "@/lib/SiteContext"
import CdpProvider from "@/components/CdpProvider"
import StatusPopover from "@/components/StatusPopover"
import ScriptInjector from "@/components/ScriptInjector"
import IframeUserNotifier from "@/components/IframeUserNotifier"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <SiteProvider>
          <ScriptInjector />
          <CdpProvider>
            <IframeUserNotifier />
            {children}
          </CdpProvider>
          <StatusPopover />
        </SiteProvider>
      </body>
    </html>
  )
}
