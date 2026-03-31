"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import GlassButton from "@/components/ui/GlassButton"

type HeroSlide = {
  type: "image" | "video"
  desktop: string
  mobile: string
  alt: string
  kicker?: string
  headline: string
  subline?: string
  cta: string
  ctaHref: string
}

const SLIDES: HeroSlide[] = [
  {
    type: "image",
    desktop: "/images/hero/hero-desk-1.webp",
    mobile: "/images/hero/hero-mobile-2.webp",
    alt: "Ice Industry — Terrain Sauvage",
    kicker: "Nouvelle Capsule",
    headline: "Terrain Sauvage",
    subline: "Collection Hiver 2026",
    cta: "Découvrir la collection",
    ctaHref: "/collections/capsule-arctic",
  },
  {
    type: "image",
    desktop: "/images/hero/hero-desk-2.webp",
    mobile: "/images/hero/hero-mobile-1.webp",
    alt: "Ice Industry — Nés du Froid",
    kicker: "Marseille",
    headline: "Nés du Froid",
    subline: "Streetwear Technique",
    cta: "Explorer l'univers",
    ctaHref: "/boutique",
  },
]

const SLIDE_DURATION = 6000
const FADE_MS = 1000

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef(0)

  // Auto-advance
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_DURATION)
  }, [])

  const pauseCarousel = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (pauseTimeoutRef.current) { clearTimeout(pauseTimeoutRef.current); pauseTimeoutRef.current = null }
  }, [])

  const resumeCarousel = useCallback(() => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    pauseTimeoutRef.current = setTimeout(() => { startTimer() }, 800)
  }, [startTimer])

  useEffect(() => {
    // Trigger Ken Burns zoom on first slide after mount
    requestAnimationFrame(() => setMounted(true))
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    }
  }, [startTimer])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) {
      const next =
        delta < 0
          ? (current + 1) % SLIDES.length
          : (current - 1 + SLIDES.length) % SLIDES.length
      goToSlide(next)
    }
  }

  const goToSlide = (index: number) => {
    setCurrent(index)
    startTimer()
  }

  return (
    <section
      className="relative h-dvh w-full overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Media layers (image or video) ── */}
      {SLIDES.map((slide, index) => {
        const active = index === current
        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              opacity: active ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
              zIndex: active ? 1 : 0,
            }}
            aria-hidden={!active}
          >
            {slide.type === "video" ? (
              <>
                {/* Desktop video */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover hidden md:block"
                >
                  <source src={slide.desktop} />
                </video>
                {/* Mobile video */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover block md:hidden"
                >
                  <source src={slide.mobile} />
                </video>
              </>
            ) : (
              <>
                {/* Desktop image */}
                <Image
                  src={slide.desktop}
                  alt={slide.alt}
                  fill
                  className="object-cover hidden md:block"
                  style={{
                    transform: mounted && active ? "scale(1.04)" : "scale(1)",
                    transition: `transform ${SLIDE_DURATION}ms ease-out`,
                  }}
                  priority={index === 0}
                  quality={80}
                  sizes="100vw"
                />
                {/* Mobile image */}
                <Image
                  src={slide.mobile}
                  alt={slide.alt}
                  fill
                  className="object-cover block md:hidden"
                  style={{
                    transform: mounted && active ? "scale(1.04)" : "scale(1)",
                    transition: `transform ${SLIDE_DURATION}ms ease-out`,
                  }}
                  priority={index === 0}
                  quality={80}
                  sizes="100vw"
                />
              </>
            )}
          </div>
        )
      })}

      {/* ── Dim global — uniform dark overlay like Represent ── */}
      <div
        className="absolute inset-0 bg-black/30 pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* ── Full-area clickable link for active slide ── */}
      <Link
        href={SLIDES[current].ctaHref}
        className="absolute inset-0 z-[2] cursor-pointer"
        aria-label={SLIDES[current].cta}
      />

      {/* ── Text per slide — compact statement block (Represent style) ── */}
      {SLIDES.map((slide, index) => {
        const active = index === current
        return (
          <div
            key={`t-${index}`}
            className="absolute inset-0 flex items-end pointer-events-none"
            style={{
              zIndex: 3,
              visibility: active ? "visible" : "hidden",
              transition: `visibility 0s ${active ? "0s" : `${FADE_MS}ms`}`,
            }}
          >
            <div className="w-full px-5 md:px-6 lg:px-10 pb-20 md:pb-24 lg:pb-28 text-left md:text-center flex flex-col items-start md:items-center pointer-events-none">
              {/* Statement block — unified text group */}
              <div className="flex flex-col items-start md:items-center gap-3 md:gap-4 mb-6 md:mb-7">
                {/* Kicker — optional, wide tracking */}
                {slide.kicker && (
                  <p
                    className="text-xs md:text-sm uppercase tracking-[0.3em] text-white font-light"
                    style={{
                      transform: active ? "translateY(0)" : "translateY(12px)",
                      opacity: active ? 1 : 0,
                      transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.7s ease",
                      transitionDelay: active ? "0.15s" : "0s",
                    }}
                  >
                    {slide.kicker}
                  </p>
                )}

                {/* Headline — fat, tight tracking */}
                <h1
                  className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
                  style={{
                    transform: active ? "translateY(0)" : "translateY(14px)",
                    opacity: active ? 1 : 0,
                    transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.8s ease",
                    transitionDelay: active ? "0.3s" : "0s",
                  }}
                >
                  {slide.headline}
                </h1>

                {/* Subline — optional, wide tracking */}
                {slide.subline && (
                  <p
                    className="text-xs md:text-sm uppercase tracking-[0.3em] text-white font-light"
                    style={{
                      transform: active ? "translateY(0)" : "translateY(12px)",
                      opacity: active ? 1 : 0,
                      transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.7s ease",
                      transitionDelay: active ? "0.45s" : "0s",
                    }}
                  >
                    {slide.subline}
                  </p>
                )}
              </div>

              {/* CTA — Glass button with shiny text on hover */}
              <Link
                href={slide.ctaHref}
                className="shiny-btn pointer-events-auto relative z-[4] inline-flex items-center justify-center h-10 px-7 rounded-[2px] border border-white/30 bg-black/30 backdrop-blur-md uppercase tracking-[0.18em] text-[11px] md:text-xs font-medium self-start md:self-center"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? "translateY(0)" : "translateY(10px)",
                  transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.7s ease",
                  transitionDelay: active ? "0.6s" : "0s",
                }}
                onMouseEnter={pauseCarousel}
                onMouseLeave={resumeCarousel}
              >
                <span className="shiny-text">{slide.cta}</span>
              </Link>
            </div>
          </div>
        )
      })}
    </section>
  )
}
