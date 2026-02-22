"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

const cards = [
  {
    title: "Notre Boutique",
    subtitle: "Marseille",
    description: "Retrouvez-nous au coeur de Marseille. Decouvrez l'univers Ice Industry en personne.",
    href: "/boutique",
    cta: "Decouvrir la boutique",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  },
  {
    title: "Newsletter",
    subtitle: "Ne rate aucun drop",
    description: "Acces anticipe aux collections, offres exclusives et coulisses de la marque.",
    href: "/newsletter",
    cta: "S'inscrire",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  },
  {
    title: "Ice Gallery",
    subtitle: "Backstage",
    description: "Notre univers visuel. Shootings, collaborations et inspirations streetwear.",
    href: "/voir-tout",
    cta: "Voir la Ice Gallery",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
  },
]

export default function TriptyqueSection() {
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
      { threshold: 0.1 }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-white"
    >
      <div
        className={`max-w-7xl mx-auto px-6 md:px-10 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative aspect-[3/4] overflow-hidden block"
            >
              {/* Background image */}
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />

              {/* Content — anchored to bottom */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">
                  {card.subtitle}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 uppercase tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-white/70 mb-6 leading-relaxed max-w-xs">
                  {card.description}
                </p>
                <span className="inline-block bg-white text-black px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] group-hover:bg-white/90 transition-colors self-start">
                  {card.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
