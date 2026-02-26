"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

const SHOE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80",
    alt: "Nike sneaker rouge",
  },
  {
    src: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1920&q=80",
    alt: "Sneaker blanche",
  },
  {
    src: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1920&q=80",
    alt: "Jordan sneaker",
  },
]

export default function ShoesSection() {
  const [current, setCurrent] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SHOE_IMAGES.length)
    }, 4000)
  }, [])

  useEffect(() => {
    startInterval()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startInterval])

  const goToSlide = (index: number) => {
    setCurrent(index)
    startInterval()
  }

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-muted"
    >
      <div
        className={`max-w-7xl mx-auto px-6 md:px-10 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Crossfade image carousel */}
          <div className="relative aspect-square overflow-hidden bg-white">
            {SHOE_IMAGES.map((image, index) => (
              <div
                key={image.src}
                className="absolute inset-0 transition-opacity ease-in-out"
                style={{
                  opacity: index === current ? 1 : 0,
                  transitionDuration: "1200ms",
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            ))}

            {/* Slide indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {SHOE_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-8 h-0.5 transition-colors duration-300 ${
                    index === current ? "bg-black" : "bg-black/20"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Text content */}
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Sélection
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight mb-6">
              Chaussures
            </h2>
            <p className="text-base text-muted-foreground mb-10 max-w-sm leading-relaxed">
              Nike, Jordan, New Balance. Éditions exclusives et modèles sélectionnés par Ice Industry.
            </p>
            <Link
              href="/categories/chaussures"
              className="inline-block bg-black text-white px-10 py-4 text-xs font-medium uppercase tracking-[0.25em] hover:bg-black/90 transition-colors self-start"
            >
              Découvrir la sélection
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
