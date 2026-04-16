"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"

type ProductImage = { id: string; url: string }

export default function ProductImages({ images }: { images: ProductImage[] }) {
  const [current, setCurrent] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchDelta = useRef(0)
  const isDragging = useRef(false)

  const total = images.length

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, total - 1))
      setCurrent(clamped)
    },
    [total]
  )

  // Sync scroll position on current change
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.3s ease-out"
      trackRef.current.style.transform = `translateX(-${current * 100}%)`
    }
  }, [current])

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true
    touchStartX.current = e.touches[0].clientX
    touchDelta.current = 0
    if (trackRef.current) trackRef.current.style.transition = "none"
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    touchDelta.current = e.touches[0].clientX - touchStartX.current
    if (trackRef.current) {
      const offset = -current * 100
      const pxToPercent = (touchDelta.current / window.innerWidth) * 100
      trackRef.current.style.transform = `translateX(${offset + pxToPercent}%)`
    }
  }

  const onTouchEnd = () => {
    isDragging.current = false
    const threshold = window.innerWidth * 0.15
    if (touchDelta.current < -threshold) goTo(current + 1)
    else if (touchDelta.current > threshold) goTo(current - 1)
    else goTo(current) // snap back
  }

  if (!images || total === 0) {
    return (
      <div className="aspect-[3/4] bg-muted flex items-center justify-center text-muted-foreground text-sm">
        Pas d&apos;image
      </div>
    )
  }

  return (
    <>
      {/* ── MOBILE: Full-width swipeable carousel ── */}
      <div className="md:hidden">
        <div
          className="relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div ref={trackRef} className="flex will-change-transform">
            {images.map((image, i) => (
              <div
                key={image.id}
                className="w-full flex-shrink-0 aspect-[3/4] relative bg-[#f5f5f5]"
              >
                <Image
                  src={image.url}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          {/* Counter — "1 / 8" */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-white/80 tracking-[0.15em] bg-black/30 backdrop-blur-sm px-3 py-1">
              {current + 1} / {total}
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP: 2-column image grid, scrolls naturally ── */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-1">
          {images.map((image, i) => (
            <div
              key={image.id}
              className={`relative bg-[#f5f5f5] overflow-hidden ${
                // If odd number of images, last one spans full width
                i === total - 1 && total % 2 !== 0 ? "col-span-2 aspect-[3/2]" : "aspect-[3/4]"
              }`}
            >
              <Image
                src={image.url}
                alt={`Image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 50vw, 640px"
                priority={i < 2}
                loading={i < 2 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
