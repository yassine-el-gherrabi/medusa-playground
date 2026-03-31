"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Collection } from "@/types"

type CollectionCarouselProps = {
  collections: Collection[]
}

/* Slide width: half viewport on desktop, 85vw on mobile */
const SLIDE_WIDTH_DESKTOP = 50 // vw
const SLIDE_WIDTH_MOBILE = 85 // vw
const SLIDE_GAP = 0 // px — no visible separation
const SCROLL_SPEED = 0.4 // px per frame (~24px/s at 60fps)

export default function CollectionCarousel({ collections }: CollectionCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [paused, setPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const animRef = useRef<number>(0)
  const offsetRef = useRef(0)
  const isDragging = useRef(false)
  const dragStart = useRef(0)
  const dragOffset = useRef(0)

  // Triple the items for seamless infinite loop
  const tripled = [...collections, ...collections, ...collections]

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Intersection observer for fade-in
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

  // Get one set width in pixels
  const getSetWidth = useCallback(() => {
    const vw = window.innerWidth
    const slideW = isMobile
      ? (SLIDE_WIDTH_MOBILE / 100) * vw
      : (SLIDE_WIDTH_DESKTOP / 100) * vw
    return (slideW + SLIDE_GAP) * collections.length
  }, [collections.length, isMobile])

  // Auto-scroll animation
  useEffect(() => {
    const animate = () => {
      if (!paused && !isDragging.current) {
        offsetRef.current += SCROLL_SPEED
        // Reset when we've scrolled past one full set
        const setWidth = getSetWidth()
        if (offsetRef.current >= setWidth) {
          offsetRef.current -= setWidth
        }
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [paused, getSetWidth])

  // Manual navigation
  const slideBy = useCallback(
    (direction: number) => {
      const vw = window.innerWidth
      const slideW = isMobile
        ? (SLIDE_WIDTH_MOBILE / 100) * vw
        : (SLIDE_WIDTH_DESKTOP / 100) * vw
      offsetRef.current += direction * (slideW + SLIDE_GAP)
      const setWidth = getSetWidth()
      if (offsetRef.current < 0) offsetRef.current += setWidth
      if (offsetRef.current >= setWidth) offsetRef.current -= setWidth
    },
    [isMobile, getSetWidth]
  )

  // Drag/touch support
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    dragStart.current = e.clientX
    dragOffset.current = offsetRef.current
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const delta = dragStart.current - e.clientX
    offsetRef.current = dragOffset.current + delta
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    // Normalize
    const setWidth = getSetWidth()
    if (offsetRef.current < 0) offsetRef.current += setWidth
    if (offsetRef.current >= setWidth) offsetRef.current -= setWidth
  }, [getSetWidth])

  if (collections.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0a0a0a] overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      <div
        className={`transition-all duration-1000 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 md:px-10 pt-10 md:pt-14 pb-8 md:pb-10">
          <div className="flex items-center gap-6 md:gap-12">
            <h2 className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-white">
              Explorer
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Pause/Play */}
            <button
              onClick={() => setPaused((p) => !p)}
              className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
              {paused ? (
                <>
                  <span className="inline-block w-0 h-0 border-l-[6px] border-l-current border-y-[4px] border-y-transparent" />
                  Lecture
                </>
              ) : (
                <>
                  <span className="inline-flex gap-[2px]">
                    <span className="w-[2px] h-3 bg-current" />
                    <span className="w-[2px] h-3 bg-current" />
                  </span>
                  Mettre en pause
                </>
              )}
            </button>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => slideBy(-1)}
                className="text-white/40 hover:text-white transition-colors duration-300 p-1"
                aria-label="Précédent"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => slideBy(1)}
                className="text-white/40 hover:text-white transition-colors duration-300 p-1"
                aria-label="Suivant"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel track */}
        <div
          className="cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            ref={trackRef}
            className="flex will-change-transform"
            style={{ gap: `${SLIDE_GAP}px` }}
          >
            {tripled.map((collection, i) => (
              <Link
                key={`${collection.id}-${i}`}
                href={`/collections/${collection.handle}`}
                className="flex-shrink-0 relative group block"
                style={{
                  width: isMobile ? `${SLIDE_WIDTH_MOBILE}vw` : `${SLIDE_WIDTH_DESKTOP}vw`,
                  height: isMobile ? "70vh" : "100vh",
                }}
                draggable={false}
                onClick={(e) => {
                  // Prevent navigation on drag
                  if (Math.abs(offsetRef.current - dragOffset.current) > 10) {
                    e.preventDefault()
                  }
                }}
              >
                {/* Image */}
                <div className="absolute inset-0 overflow-hidden">
                  {(collection.metadata as Record<string, string>)?.hero_image ? (
                    <Image
                      src={(collection.metadata as Record<string, string>).hero_image}
                      alt={collection.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes={isMobile ? "85vw" : "50vw"}
                      draggable={false}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/5 uppercase">Ice</span>
                    </div>
                  )}
                </div>

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />

                {/* Category label — centered */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <h3 className="text-sm md:text-base font-medium uppercase tracking-[0.2em] text-white flex items-center gap-2">
                    <span className="text-white/60">&rarr;</span>
                    {collection.title}
                  </h3>
                </div>

                {/* Discover link — bottom center */}
                <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center z-10">
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/50 group-hover:text-white transition-colors duration-300">
                    Découvrir
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
