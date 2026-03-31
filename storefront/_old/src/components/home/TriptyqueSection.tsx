"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

const cards = [
  {
    title: "Notre boutique à Marseille",
    subtitle: "Boutique",
    description: "Retrouvez-nous au cœur de Marseille. Découvrez l'univers Ice Industry en personne.",
    href: "/notre-boutique",
    cta: "Découvrir la boutique",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  },
  {
    title: "Newsletter",
    subtitle: "Ne rate aucun drop",
    description: "Accès anticipé aux collections, offres exclusives et coulisses de la marque.",
    href: "/newsletter",
    cta: "S'inscrire",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  },
  {
    title: "Ice Gallery",
    subtitle: "Backstage",
    description: "Notre univers visuel. Shootings, collaborations et inspirations streetwear.",
    href: "/boutique",
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
      className="py-14 md:py-20 bg-white"
    >
      <div
        className={`max-w-7xl mx-auto px-6 md:px-10 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <h3 className="text-lg md:text-xl font-semibold text-white mb-3 uppercase tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-white/70 mb-6 leading-relaxed max-w-xs">
                  {card.description}
                </p>
                <span className="shiny-btn inline-flex items-center justify-center h-10 px-7 rounded-[2px] border border-white/30 bg-black/30 backdrop-blur-md uppercase tracking-[0.18em] text-[11px] md:text-xs font-medium self-start text-white">
                  <span className="shiny-text">{card.cta}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
