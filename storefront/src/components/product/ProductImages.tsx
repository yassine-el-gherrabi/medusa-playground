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

  const goTo = useCallback(
    (index: number) => setCurrent(Math.max(0, Math.min(index, total - 1))),
    [total]
  )

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.3s ease-out"
      trackRef.current.style.transform = `translateX(-${current * 100}%)`
    }
  }, [current])

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
    else goTo(current)
  }

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
          <div ref={trackRef} className="flex will-change-transform">
            {images.map((image, i) => (
              <button
                key={image.id}
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
                  priority={i === 0}
                />
              </button>
            ))}
          </div>

          {/* Counter — bottom left, no background */}
          {total > 1 && (
            <div className="absolute bottom-4 left-4 text-[11px] text-black tracking-[0.15em]">
              {current + 1} / {total}
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
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-12 bg-white/90 backdrop-blur-sm">
              <span className="text-[11px] tracking-[0.15em] text-muted-foreground">
                {images.length} images
              </span>
              <button
                onClick={() => setGalleryOpen(false)}
                className="p-2 -mr-2 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
            </div>

            {/* Vertical scroll of all images */}
            <div className="overflow-y-auto h-[calc(100dvh-48px)]">
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
