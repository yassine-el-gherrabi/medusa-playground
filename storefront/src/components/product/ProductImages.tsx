"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

type ProductImage = { id: string; url: string }

export default function ProductImages({ images }: { images: ProductImage[] }) {
  const [current, setCurrent] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchDelta = useRef(0)
  const isDragging = useRef(false)

  const total = images.length

  // For infinite loop: we prepend last image and append first image
  // Layout: [clone-last] [0] [1] ... [N-1] [clone-first]
  // Visual index 0 = track position 1
  const trackIndex = current + 1 // offset by 1 because of prepended clone

  const slideTo = useCallback((index: number, animate = true) => {
    if (trackRef.current) {
      trackRef.current.style.transition = animate ? "transform 0.3s ease-out" : "none"
      trackRef.current.style.transform = `translateX(-${index * 100}%)`
    }
  }, [])

  useEffect(() => {
    slideTo(trackIndex)
  }, [trackIndex, slideTo])

  // After transition to a clone, instantly jump to the real slide
  const handleTransitionEnd = useCallback(() => {
    if (current >= total) {
      setCurrent(0)
      slideTo(1, false) // jump to real first
    } else if (current < 0) {
      setCurrent(total - 1)
      slideTo(total, false) // jump to real last
    }
  }, [current, total, slideTo])

  const goTo = useCallback(
    (index: number) => setCurrent(index),
    []
  )

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
      const offset = -trackIndex * 100
      const pxToPercent = (touchDelta.current / window.innerWidth) * 100
      trackRef.current.style.transform = `translateX(${offset + pxToPercent}%)`
    }
  }

  const onTouchEnd = () => {
    isDragging.current = false
    const threshold = window.innerWidth * 0.15
    if (touchDelta.current < -threshold) goTo(current + 1)
    else if (touchDelta.current > threshold) goTo(current - 1)
    else slideTo(trackIndex) // snap back
  }

  // Build the looped slide array: [clone-last, ...images, clone-first]
  const loopedImages = total > 1
    ? [images[total - 1], ...images, images[0]]
    : images

  // Display index (always 0..total-1 for the counter)
  const displayIndex = ((current % total) + total) % total

  // Lock body scroll when gallery is open
  useEffect(() => {
    if (galleryOpen) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      return () => {
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        window.scrollTo(0, scrollY)
      }
    }
  }, [galleryOpen])

  if (!images || total === 0) {
    return (
      <div className="aspect-[3/4] bg-[#f5f5f5] flex items-center justify-center text-muted-foreground text-sm">
        Pas d&apos;image
      </div>
    )
  }

  return (
    <>
      {/* ── MOBILE: Horizontal carousel ── */}
      <div className="lg:hidden">
        <div
          className="relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            ref={trackRef}
            className="flex will-change-transform"
            onTransitionEnd={handleTransitionEnd}
          >
            {loopedImages.map((image, i) => (
              <button
                key={`${image.id}-${i}`}
                className="w-full flex-shrink-0 aspect-[3/4] relative bg-[#f5f5f5] cursor-zoom-in"
                onClick={() => {
                  if (Math.abs(touchDelta.current) < 10) setGalleryOpen(true)
                }}
              >
                <Image
                  src={image.url}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={i <= 1}
                />
              </button>
            ))}
          </div>

          {/* Counter — bottom left, no background */}
          {total > 1 && (
            <div className="absolute bottom-4 left-4 text-[11px] text-black tracking-[0.15em]">
              {displayIndex + 1} / {total}
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP: 2-column grid ── */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-1">
          {images.map((image, i) => (
            <div
              key={image.id}
              className={`relative bg-[#f5f5f5] overflow-hidden ${
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

      {/* ── FULLSCREEN GALLERY (mobile tap-to-open) ── */}
      {galleryOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-white">
            {/* Close button overlay */}
            <button
              onClick={() => setGalleryOpen(false)}
              className="fixed top-4 right-4 z-10 p-2 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>

            {/* Vertical scroll of all images */}
            <div className="overflow-y-auto h-dvh">
              {images.map((image, i) => (
                <div key={image.id} className="w-full aspect-[3/4] relative bg-[#f5f5f5]">
                  <Image
                    src={image.url}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={i < 3}
                  />
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
