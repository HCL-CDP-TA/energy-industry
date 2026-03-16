"use client"

import { InteractClient, InteractParamType, Offer } from "@hcl-cdp-ta/interact-sdk"
import Link from "next/link"
import Image from "next/image"
import { Button } from "./ui/button"
import { useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"

export interface OfferCardProps {
  offer: Offer
  client: InteractClient | null
  disableCta?: boolean
}

export const OfferCard = ({ offer, client, disableCta }: OfferCardProps) => {
  const { getUserSessionId } = useCdp()

  const autoTrack = offer.n === "Default Offer" ? false : true

  const getOfferAttribute = (name: string, fallback: string = "") => {
    return (
      offer.attributes?.find(
        (attr: { n: string; v: string | number | boolean | null; t: string | null }) => attr.n === name,
      )?.v || fallback
    )
  }

  const offerData = {
    title: getOfferAttribute("offer_title"),
    description: getOfferAttribute("offer_copy"),
    imageUrl: getOfferAttribute("AbsoluteBannerURL"),
    ctaText: getOfferAttribute("offer_cta"),
    ctaLink: getOfferAttribute("AbsoluteLandingPageURL"),
  }

  const handleContact = async () => {
    await client?.postEvent(
      "Contact",
      [InteractClient.createParameter("UACIOfferTrackingCode", offer.treatmentCode, InteractParamType.String)],
      { sessionId: getUserSessionId(), autoManageSession: true },
    )
  }

  // Handle accept action
  const handleAccept = async () => {
    if (autoTrack) {
      await client?.postEvent(
        "Accept",
        [InteractClient.createParameter("UACIOfferTrackingCode", offer.treatmentCode, InteractParamType.String)],
        { sessionId: getUserSessionId(), autoManageSession: true },
      )
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden flex items-center min-h-[300px]" aria-label={offerData.title}>
      {/* Background Image */}
      <Image
        src={offerData.imageUrl}
        alt={offerData.title}
        fill
        className="object-cover"
        onLoad={autoTrack ? handleContact : undefined}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/60 z-10" />
      {/* Content */}
      <div className="relative z-20 p-6 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{offerData.title}</h2>
        <p className="text-lg md:text-xl mb-8 text-slate-200 leading-relaxed">{offerData.description}</p>
        {disableCta ? (
          <Button size="lg" className="bg-primary px-6 py-2 cursor-pointer" onClick={() => {}}>
            {offerData.ctaText}
          </Button>
        ) : (
          <Link href={offerData.ctaLink}>
            <Button size="lg" className="bg-primary px-6 py-2 cursor-pointer" onClick={handleAccept}>
              {offerData.ctaText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default OfferCard
