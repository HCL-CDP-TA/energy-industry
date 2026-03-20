"use client"

import React, { useRef, useEffect, useCallback, useLayoutEffect } from "react"
import { useTranslations } from "next-intl"
import { useSiteContext } from "@/lib/SiteContext"
import { useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"
import { useCDPTracking } from "@/lib/hooks/useCDPTracking"
import { MapPin } from "lucide-react"

interface AddressLookupProps {
  onAddressChange: (address: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function AddressLookup({ onAddressChange, inputRef: externalInputRef }: AddressLookupProps) {
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = externalInputRef ?? internalInputRef
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const t = useTranslations("plans.addressLookup")
  const { brand, locale } = useSiteContext()
  const { track } = useCdp()
  const { isCDPTrackingEnabled } = useCDPTracking()

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const localeCountryMap: Record<string, string> = {
    "en-US": "us",
    "en-GB": "gb",
    "en-AU": "au",
    "en-CA": "ca",
    "en-IN": "in",
    "fr-CA": "ca",
    "de": "de",
    "it-IT": "it",
    "sv-SE": "se",
  }

  const saveAddress = useCallback((place: google.maps.places.PlaceResult) => {
    const components = place.address_components || []
    const get = (type: string, nameType: "long_name" | "short_name" = "long_name") =>
      components.find(c => c.types.includes(type))?.[nameType] ?? ""

    const addressParts = {
      street_number: get("street_number"),
      street_name: get("route"),
      suburb: get("locality") || get("sublocality"),
      state: get("administrative_area_level_1", "short_name"),
      postcode: get("postal_code"),
      country: get("country", "short_name"),
      formatted_address: place.formatted_address ?? "",
    }

    const storageKey = `${brand.key}_customer_data`
    const existing = JSON.parse(localStorage.getItem(storageKey) || "{}")
    existing.address = addressParts
    localStorage.setItem(storageKey, JSON.stringify(existing))
    onAddressChange(addressParts.formatted_address)
    if (isCDPTrackingEnabled) {
      track({ identifier: "plan_consider", properties: addressParts })
    }
  }, [brand.key, onAddressChange, isCDPTrackingEnabled, track])

  const saveAddressRef = useRef<typeof saveAddress>(saveAddress)
  useLayoutEffect(() => { saveAddressRef.current = saveAddress }, [saveAddress])

  useEffect(() => {
    if (!apiKey || !inputRef.current) return

    const scriptId = "google-maps-script"

    autocompleteRef.current = null

    function initAutocomplete() {
      if (!inputRef.current || autocompleteRef.current) return
      const countryCode = localeCountryMap[locale.code]
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        fields: ["formatted_address", "address_components", "geometry"],
        ...(countryCode ? { componentRestrictions: { country: countryCode } } : {}),
      })
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current!.getPlace()
        if (place.address_components?.length) {
          saveAddressRef.current(place)
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
  }, [apiKey, locale.code, saveAddress])

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
