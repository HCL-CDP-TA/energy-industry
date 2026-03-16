"use client"

import { InteractClient, InteractParamType, Offer } from "@hcl-cdp-ta/interact-sdk"
import Hero from "./Hero"
import { useCdp } from "@hcl-cdp-ta/hclcdp-web-sdk-react"

export interface OfferCardProps {
  offer: Offer
  client?: InteractClient | null
}

export const OfferHero = ({ offer, client }: OfferCardProps) => {
  const { getUserSessionId } = useCdp()

  const autoTrack = offer.n === "Default Offer" ? false : true

  const getOfferAttribute = (name: string, fallback: string = "") => {
    return (
      offer.attributes?.find(
        (attr: { n: string; v: string | number | boolean | null; t: string | null }) => attr.n === name,
      )?.v || fallback
    )
  }

  // Helper function to transform highlight tags to JSX elements
  const transformHighlights = (text: string): React.ReactNode => {
    if (!text.includes("<highlight>")) {
      return text
    }

    const parts = text.split(/(<highlight>.*?<\/highlight>)/g)

    return parts.map((part, index) => {
      if (part.startsWith("<highlight>") && part.endsWith("</highlight>")) {
        const content = part.replace(/<\/?highlight>/g, "")
        return (
          <span key={index} className="text-green-400">
            {content}
          </span>
        )
      }
      return part
    })
  }

  const offerData = {
    title: transformHighlights(getOfferAttribute("offer_title")),
    description: transformHighlights(getOfferAttribute("offer_copy")),
    imageUrl: getOfferAttribute("AbsoluteBannerURL"),
    ctaText: getOfferAttribute("offer_cta"),
    ctaLink: getOfferAttribute("AbsoluteLandingPageURL"),
  }

  const handleContact = async () => {
    if (autoTrack) {
      await client?.postEvent(
        "Contact",
        [InteractClient.createParameter("UACIOfferTrackingCode", offer.treatmentCode, InteractParamType.String)],
        { sessionId: getUserSessionId(), autoManageSession: true },
      )
    }
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
    <div id="interact-hero">
      <Hero
        title={offerData.title}
        subTitle={offerData.description}
        ctaText={offerData.ctaText}
        ctaUrl={offerData.ctaLink}
        imageUrl={offerData.imageUrl}
        handleImageLoad={handleContact}
        handleOfferClick={handleAccept}
      />
    </div>
  )
}

export default OfferHero
