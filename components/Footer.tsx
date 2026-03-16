"use client"
import { Phone, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import NavLink from "./common/NavLink"
import { useSiteContext } from "@/lib/SiteContext"

const Footer = () => {
  const { brand, getFullPath } = useSiteContext()
  const t = useTranslations("footer")

  const navItems = useTranslations().raw("products") as Array<{ label: string; href: string }>

  return (
    <footer className="bg-[var(--secondary)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <brand.icon className="h-8 w-8 text-[var(--primary)]" />
              <span className="text-2xl font-bold">{brand.label}</span>
            </div>
            <p className="mb-4 leading-relaxed text-muted-foreground">{t("description")}</p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>{t("phone")}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>{t("email")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t("sections.products.title")}</h3>
            <ul className="space-y-2">
              {navItems.map(item => (
                <li key={item.label}>
                  <NavLink key={item.label} href={getFullPath(item.href)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t("sections.support.title")}</h3>
            <ul className="space-y-2">
              <li>
                <NavLink href="#">{t("sections.support.contact")}</NavLink>
              </li>
              <li>
                <NavLink href="#">{t("sections.support.help")}</NavLink>
              </li>
              <li>
                <NavLink href="#">{t("sections.support.security")}</NavLink>
              </li>
              <li>
                <NavLink href="#">{t("sections.support.privacy")}</NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-muted-foreground mt-8 pt-8 text-center text-muted-foreground">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
