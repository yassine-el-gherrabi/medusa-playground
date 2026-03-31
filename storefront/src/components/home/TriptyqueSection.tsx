"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

export type TriptyqueCard = {
  title: string
  subtitle: string
  description: string
  href: string
  cta: string
  image: string
}

type TriptiqueSectionProps = {
  cards: TriptyqueCard[]
}

export default function TriptyqueSection({ cards }: TriptiqueSectionProps) {
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

  if (cards.length === 0) return null

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
