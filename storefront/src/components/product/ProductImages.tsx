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

  // Scroll-snap based carousel — native, smooth, handles fast swiping perfectly
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    // Debounce to get final position after momentum scroll ends
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      if (!scrollRef.current) return
      const scrollLeft = scrollRef.current.scrollLeft
      const width = scrollRef.current.offsetWidth
      const index = Math.round(scrollLeft / width)
      setCurrent(((index % total) + total) % total)
      isScrolling.current = false
    }, 50)
  }, [total])

  // Programmatic scroll to index
  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return
    const width = scrollRef.current.offsetWidth
    scrollRef.current.scrollTo({ left: index * width, behavior: "smooth" })
  }, [])

  // When reaching the end or start, jump to enable infinite feel
  const handleScrollEnd = useCallback(() => {
    if (!scrollRef.current || total <= 1) return
    const scrollLeft = scrollRef.current.scrollLeft
    const width = scrollRef.current.offsetWidth
    const maxScroll = (total - 1) * width

    // At the very end — user swiped past last image
    if (scrollLeft >= maxScroll + width * 0.3) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
    }
  }, [total])

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
          {images.map((image, i) => (
            <button
              key={image.id}
              className="w-full flex-shrink-0 snap-center aspect-[3/4] relative bg-[#f5f5f5] cursor-zoom-in"
              onClick={() => setGalleryOpen(true)}
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
