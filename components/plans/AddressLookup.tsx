"use client"

import { useRef, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useSiteContext } from "@/lib/SiteContext"
import { MapPin } from "lucide-react"

export function AddressLookup() {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const t = useTranslations("plans.addressLookup")
  const { brand } = useSiteContext()

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const saveAddress = useCallback((formattedAddress: string) => {
    const storageKey = `${brand.key}_customer_data`
    const existing = JSON.parse(localStorage.getItem(storageKey) || "{}")
    existing.address = formattedAddress
    localStorage.setItem(storageKey, JSON.stringify(existing))
  }, [brand.key])

  useEffect(() => {
    if (!apiKey || !inputRef.current) return

    const scriptId = "google-maps-script"

    function initAutocomplete() {
      if (!inputRef.current || autocompleteRef.current) return
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        fields: ["formatted_address", "address_components", "geometry"],
      })
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current!.getPlace()
        if (place.formatted_address) {
          saveAddress(place.formatted_address)
        }
      })
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.onload = () => initAutocomplete()
      document.head.appendChild(script)
    } else if (window.google?.maps?.places) {
      initAutocomplete()
    } else {
      const existing = document.getElementById(scriptId) as HTMLScriptElement
      const origOnload = existing.onload
      existing.onload = (e) => {
        if (typeof origOnload === "function") origOnload.call(existing, e)
        initAutocomplete()
      }
    }
  }, [apiKey, saveAddress])

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">{t("title")}</h2>
          <p className="text-slate-600 mb-6">{t("subtitle")}</p>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t("placeholder")}
              className="flex h-12 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
