"use client"

import { useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"

type ProductImage = { id: string; url: string }

export default function ProductImages({ images }: { images: ProductImage[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [current, setCurrent] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const total = images.length

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrent(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    onSelect()
    return () => { emblaApi.off("select", onSelect) }
  }, [emblaApi, onSelect])

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
      {/* ── MOBILE: Embla carousel with infinite loop ── */}
      <div className="lg:hidden relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {images.map((image, i) => (
              <button
                key={image.id}
                className="flex-[0_0_100%] min-w-0 aspect-[3/4] relative bg-[#f5f5f5] cursor-zoom-in"
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
