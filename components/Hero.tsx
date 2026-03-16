import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { ChevronsRight } from "lucide-react"
import React, { ReactNode } from "react"

type HeroProps = {
  title: ReactNode | string
  subTitle: ReactNode | string
  ctaText: string
  ctaUrl?: string
  imageUrl: string
  handleImageLoad?: () => void
  handleOfferClick?: () => void
}

const Hero = ({ title, subTitle, ctaText, ctaUrl = "#", imageUrl, handleImageLoad, handleOfferClick }: HeroProps) => {
  return (
    <section className="relative min-h-[30vh]">
      <Image src={imageUrl} alt="" fill priority className="object-cover" quality={100} onLoad={handleImageLoad} />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-6xl text-center max-w-3xl">
          {title}
        </h1>
        <p className="text-xl md:text-2xl my-8 text-slate-200 max-w-3xl mx-auto text-center">{subTitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={ctaUrl} onClick={handleOfferClick}>
            <Button size="lg" className="cursor-pointer">
              {ctaText}
              <ChevronsRight size={32} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
