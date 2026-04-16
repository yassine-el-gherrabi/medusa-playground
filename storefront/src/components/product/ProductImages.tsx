"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

type ProductImage = { id: string; url: string }

export default function ProductImages({ images }: { images: ProductImage[] }) {
  const [current, setCurrent] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const total = images.length

  // Instant counter update on scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || total <= 1) return
    const scrollLeft = scrollRef.current.scrollLeft
    const width = scrollRef.current.offsetWidth
    const index = Math.round(scrollLeft / width) % total
    setCurrent(((index % total) + total) % total)
  }, [total])

  // Infinite loop: when scroll settles at a clone, jump instantly to the real slide
  const handleScrollEnd = useCallback(() => {
    if (!scrollRef.current || total <= 1) return
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      if (!scrollRef.current) return
      const scrollLeft = scrollRef.current.scrollLeft
      const width = scrollRef.current.offsetWidth
      const index = Math.round(scrollLeft / width)

      // Clone of last image is at position 0 → jump to real last (index = total)
      if (index === 0) {
        scrollRef.current.style.scrollBehavior = "auto"
        scrollRef.current.scrollLeft = total * width
        scrollRef.current.style.scrollBehavior = ""
      }
      // Clone of first image is at position total+1 → jump to real first (index = 1)
      else if (index === total + 1) {
        scrollRef.current.style.scrollBehavior = "auto"
        scrollRef.current.scrollLeft = width
        scrollRef.current.style.scrollBehavior = ""
      }
    }, 60)
  }, [total])

  // Initialize scroll position to first real image (index 1, skipping prepended clone)
  useEffect(() => {
    if (scrollRef.current && total > 1) {
      const width = scrollRef.current.offsetWidth
      scrollRef.current.style.scrollBehavior = "auto"
      scrollRef.current.scrollLeft = width
      scrollRef.current.style.scrollBehavior = ""
    }
  }, [total])

  // Build looped array: [clone-last, ...images, clone-first]
  const loopedImages = total > 1
    ? [images[total - 1], ...images, images[0]]
    : images

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
      {/* ── MOBILE: Native scroll-snap carousel ── */}
      <div className="lg:hidden relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
          onTouchEnd={handleScrollEnd}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {loopedImages.map((image, i) => (
            <button
              key={`${image.id}-${i}`}
              className="w-full flex-shrink-0 snap-center aspect-[3/4] relative bg-[#f5f5f5] cursor-zoom-in"
              onClick={() => setGalleryOpen(true)}
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
          <div className="absolute bottom-4 left-4 text-[11px] text-black tracking-[0.15em] pointer-events-none">
            {current + 1} / {total}
          </div>
        )}
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
            <button
              onClick={() => setGalleryOpen(false)}
              className="fixed top-4 right-4 z-10 p-2 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>

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
