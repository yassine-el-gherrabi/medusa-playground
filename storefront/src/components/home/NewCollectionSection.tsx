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
  const description = data.metadata?.description || "Découvrez notre dernière collection. Des pièces pensées pour la rue, inspirées par Marseille."

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content — bottom-left, editorial */}
      <div
        className={`relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pb-16 md:pb-24 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">
          Nouvelle Collection
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-tight">
          {data.title}
        </h2>
        <p className="text-base md:text-lg text-white/70 mb-10 max-w-lg leading-relaxed">
          {description}
        </p>
        <Link
          href={`/collections/${data.handle}`}
          className="inline-block bg-white text-black px-10 py-4 text-xs font-medium uppercase tracking-[0.25em] hover:bg-white/90 transition-colors"
        >
          Découvrir la collection
        </Link>
      </div>
    </section>
  )
}
