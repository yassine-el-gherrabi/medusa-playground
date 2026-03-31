"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

export type ShoeImage = {
  src: string
  alt: string
}

type ShoesSectionProps = {
  images: ShoeImage[]
}

export default function ShoesSection({ images }: ShoesSectionProps) {
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
      setCurrent((prev) => (prev + 1) % images.length)
    }, 6000)
  }, [images.length])

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

  if (images.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="relative h-[65vh] md:h-[70vh] min-h-[380px] flex items-end overflow-hidden"
    >
      {/* Crossfade background images */}
      {images.map((image, index) => (
        <div
          key={image.src}
          className="absolute inset-0 transition-opacity ease-in-out"
          style={{
            opacity: index === current ? 1 : 0,
            transitionDuration: "2000ms",
          }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Uniform tint to mute bright sneaker colors + bottom gradient for text */}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Content — bottom-left editorial */}
      <div
        className={`relative z-10 w-full px-6 md:px-10 pb-16 md:pb-24 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4">
          Sélection
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 uppercase tracking-tight">
          Chaussures
        </h2>
        <Link
          href="/categories/chaussures"
          className="shiny-btn inline-flex items-center justify-center h-10 px-7 rounded-[2px] border border-white/30 bg-black/30 backdrop-blur-md uppercase tracking-[0.18em] text-[11px] md:text-xs font-medium text-white"
        >
          <span className="shiny-text">Découvrir la sélection chaussures</span>
        </Link>
      </div>

      {/* Slide indicators — bottom-right */}
      <div className="absolute bottom-6 right-6 md:right-10 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-8 h-0.5 transition-colors duration-300 ${
              index === current ? "bg-white" : "bg-white/30"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
