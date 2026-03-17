"use client"

import { useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { MapPin } from "lucide-react"
import { useSiteContext } from "@/lib/SiteContext"

interface AddressAutocompleteProps {
  onAddressChange: (address: string) => void
  placeholder?: string
  initialValue?: string
}

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

export function AddressAutocomplete({ onAddressChange, placeholder, initialValue }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const { locale } = useSiteContext()

  const handleSelect = useCallback((place: google.maps.places.PlaceResult) => {
    const formatted = place.formatted_address ?? ""
    if (inputRef.current) inputRef.current.value = formatted
    onAddressChange(formatted)
  }, [onAddressChange])

  const handleSelectRef = useRef(handleSelect)
  useLayoutEffect(() => { handleSelectRef.current = handleSelect }, [handleSelect])

  useEffect(() => {
    if (!apiKey || !inputRef.current) return

    const scriptId = "google-maps-script"

    autocompleteRef.current = null

    function initAutocomplete() {
      if (!inputRef.current || autocompleteRef.current) return
      const countryCode = localeCountryMap[locale.code]
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        fields: ["formatted_address", "address_components"],
        ...(countryCode ? { componentRestrictions: { country: countryCode } } : {}),
      })
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current!.getPlace()
        if (place.address_components?.length) {
          handleSelectRef.current(place)
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
  }, [apiKey, locale.code])

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={initialValue}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      />
    </div>
  )
}
