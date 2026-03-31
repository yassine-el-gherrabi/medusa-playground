"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

type Collection = {
  title: string
  handle: string
  metadata?: Record<string, any>
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1920&q=80"

const DEMO_COLLECTION: Collection = {
  title: "Capsule Hiver",
  handle: "voir-tout",
  metadata: {
    description: "Des pièces pensées pour la rue, inspirées par Marseille. Découvrez la nouvelle capsule Ice Industry.",
  },
}

export default function NewCollectionSection({ collection }: { collection: Collection | null }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const data = collection || DEMO_COLLECTION
  const heroImage = data.metadata?.hero_image || FALLBACK_IMAGE
  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-end overflow-hidden"
    >
      {/* Full-bleed background */}
      <Image
        src={heroImage}
        alt={data.title}
        fill
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient overlay — bottom-up for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

      {/* Content — bottom-left, editorial */}
      <div
        className={`relative z-10 w-full px-6 md:px-10 pb-16 md:pb-24 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">
          Nouvelle Collection
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 uppercase tracking-tight">
          {data.title}
        </h2>
        <p className="text-sm md:text-base text-white/60 mb-8 max-w-md leading-relaxed">
          {data.metadata?.description || "Des pièces pensées pour la rue, inspirées par Marseille."}
        </p>
        <Link
          href={`/collections/${data.handle}`}
          className="shiny-btn inline-flex items-center justify-center h-10 px-7 rounded-[2px] border border-white/30 bg-black/30 backdrop-blur-md uppercase tracking-[0.18em] text-[11px] md:text-xs font-medium text-white"
        >
          <span className="shiny-text">Découvrir la collection</span>
        </Link>
      </div>
    </section>
  )
}
