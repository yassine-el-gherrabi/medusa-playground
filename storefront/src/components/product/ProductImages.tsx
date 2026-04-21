"use client"

import { useState, useCallback, useEffect, useImperativeHandle, forwardRef, useRef } from "react"
import { createPortal } from "react-dom"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"

type ProductImage = { id: string; url: string }

export type ProductImagesHandle = {
  scrollTo: (index: number) => void
}

export type EditorialBlock = {
  label: string
  text: string
}

type ProductImagesProps = {
  images: ProductImage[]
  productTitle?: string
  editorialBlocks?: EditorialBlock[]
}

// ── Editorial image slot ──

function EditorialImage({
  image,
  index,
  productTitle,
  onOpen,
  priority = false,
  sizes = "(max-width: 1280px) 55vw, 740px",
}: {
  image: ProductImage
  index: number
  productTitle: string
  onOpen: (i: number) => void
  priority?: boolean
  sizes?: string
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <button
      onClick={() => onOpen(index)}
      className="relative block w-full bg-[#f5f5f5] !cursor-zoom-in overflow-hidden border-none p-0"
    >
      {/* Shimmer placeholder — visible until image loads */}
      {!loaded && (
        <div className="absolute inset-0 animate-shimmer-bg" />
      )}
      <Image
        src={image.url}
        alt={`${productTitle} — image ${index + 1}`}
        width={1200}
        height={1500}
        className="w-full h-auto transition-opacity duration-300"
        style={{ opacity: loaded ? 1 : 0 }}
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
      />
    </button>
  )
}

// ── Editorial text block (between images, only if data exists) ──

function EditorialAnnotation({ blocks }: { blocks: EditorialBlock[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 py-10 px-6">
      {blocks.map((block) => (
        <div key={block.label}>
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#6F6E6A]">
            {block.label}
          </span>
          <p className="font-[family-name:var(--font-display,'Inter_Tight',sans-serif)] text-[20px] font-medium tracking-[-0.02em] leading-[1.3] mt-3.5 text-[#0A0A0A]" style={{ textWrap: "pretty" }}>
            {block.text}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Main component ──

const ProductImages = forwardRef<ProductImagesHandle, ProductImagesProps>(function ProductImages({ images, productTitle = "Produit", editorialBlocks }, ref) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => emblaApi?.scrollTo(index),
  }), [emblaApi])
  const [current, setCurrent] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)
  const galleryScrollRef = useRef<HTMLDivElement>(null)

  const total = images.length
  const hasEditorial = editorialBlocks && editorialBlocks.length > 0

  // Reset carousel to first slide when images change (color switch)
  useEffect(() => {
    if (emblaApi) { emblaApi.scrollTo(0, true); setCurrent(0) }
  }, [images, emblaApi])

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

  // Scroll to clicked image when gallery opens
  useEffect(() => {
    if (galleryOpen && galleryScrollRef.current && galleryStartIndex > 0) {
      const target = document.getElementById(`gallery-img-${galleryStartIndex}`)
      if (target) target.scrollIntoView({ behavior: "instant" })
    }
  }, [galleryOpen, galleryStartIndex])

  // Escape key closes gallery
  useEffect(() => {
    if (!galleryOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setGalleryOpen(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [galleryOpen])

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

  const openGallery = useCallback((index: number) => {
    setGalleryStartIndex(index)
    setGalleryOpen(true)
  }, [])

  if (!images || total === 0) {
    return (
      <div className="aspect-[3/4] bg-[#f5f5f5] flex items-center justify-center text-muted-foreground text-sm">
        Pas d&apos;image
      </div>
    )
  }

  // ── Desktop editorial layout: distribute images ──
  // hero = [0] (always, full-width 4/5)
  // diptych = [1, 2] (only if 3+ images)
  // fullWidth1 = next after diptych (3/4)
  // [editorial text block if metadata]
  // remaining = rest, in diptych pairs (last full-width if odd)

  const hero = images[0]
  let diptych: ProductImage[] = []
  let fullWidth1: ProductImage | null = null
  let remaining: ProductImage[] = []

  if (total === 2) {
    // 2 images: hero + full-width, no diptych
    fullWidth1 = images[1]
  } else if (total === 3) {
    // 3 images: hero + diptych
    diptych = [images[1], images[2]]
  } else if (total === 4) {
    // 4 images: hero + diptych + full-width
    diptych = [images[1], images[2]]
    fullWidth1 = images[3]
  } else if (total >= 5) {
    // 5+ images: hero + diptych + full-width + [editorial] + remaining
    diptych = [images[1], images[2]]
    fullWidth1 = images[3]
    remaining = images.slice(4)
  }

  // Split remaining into diptych pairs
  const remainingPairs: ProductImage[][] = []
  let remainingSolo: ProductImage | null = null
  for (let i = 0; i < remaining.length; i += 2) {
    if (i + 1 < remaining.length) {
      remainingPairs.push([remaining[i], remaining[i + 1]])
    } else {
      remainingSolo = remaining[i]
    }
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
                onClick={() => { setGalleryStartIndex(current); setGalleryOpen(true) }}
              >
                <Image
                  src={image.url}
                  alt={`${productTitle} — image ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority={i === 0}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        {total > 1 && (
          <div className="absolute bottom-4 left-4 text-[11px] text-black tracking-[0.15em] pointer-events-none">
            {current + 1} / {total}
          </div>
        )}
      </div>

      {/* ── DESKTOP: Editorial gallery ── */}
      <div className="hidden lg:flex lg:flex-col lg:gap-1">
        {/* Hero — full-width */}
        <EditorialImage
          image={hero}
          index={0}
          productTitle={productTitle}
          onOpen={openGallery}
          priority
          sizes="(max-width: 1280px) 55vw, 740px"
        />

        {/* Diptych — 2 side-by-side */}
        {diptych.length === 2 && (
          <div className="grid grid-cols-2 gap-1 items-start">
            <EditorialImage
              image={diptych[0]}
              index={1}
              productTitle={productTitle}
              onOpen={openGallery}
              priority
              sizes="(max-width: 1280px) 27vw, 370px"
            />
            <EditorialImage
              image={diptych[1]}
              index={2}
              productTitle={productTitle}
              onOpen={openGallery}
              sizes="(max-width: 1280px) 27vw, 370px"
            />
          </div>
        )}

        {/* Full-width */}
        {fullWidth1 && (
          <EditorialImage
            image={fullWidth1}
            index={diptych.length === 2 ? 3 : 1}
            productTitle={productTitle}
            onOpen={openGallery}
          />
        )}

        {/* Editorial annotation — only if metadata provided */}
        {hasEditorial && <EditorialAnnotation blocks={editorialBlocks} />}

        {/* Remaining images: diptych pairs */}
        {remainingPairs.map((pair, pi) => {
          const baseIdx = 4 + pi * 2
          return (
            <div key={baseIdx} className="grid grid-cols-2 gap-1 items-start">
              <EditorialImage
                image={pair[0]}
                index={baseIdx}
                productTitle={productTitle}
                onOpen={openGallery}
                sizes="(max-width: 1280px) 27vw, 370px"
              />
              <EditorialImage
                image={pair[1]}
                index={baseIdx + 1}
                productTitle={productTitle}
                onOpen={openGallery}
                sizes="(max-width: 1280px) 27vw, 370px"
              />
            </div>
          )
        })}

        {/* Last image solo — full-width */}
        {remainingSolo && (
          <EditorialImage
            image={remainingSolo}
            index={total - 1}
            productTitle={productTitle}
            onOpen={openGallery}
          />
        )}
      </div>

      {/* ── FULLSCREEN GALLERY (mobile + desktop) ── */}
      {galleryOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-white" role="dialog" aria-modal="true" aria-label="Galerie d'images">
            <button
              onClick={() => setGalleryOpen(false)}
              aria-label="Fermer la galerie"
              className="fixed top-4 right-4 z-10 p-3 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>

            <div
              ref={galleryScrollRef}
              className="overflow-y-auto h-dvh"
            >
              {images.map((image, i) => (
                <div key={image.id} id={`gallery-img-${i}`} className="w-full cursor-zoom-out" onClick={() => setGalleryOpen(false)}>
                  <Image
                    src={image.url}
                    alt={`${productTitle} — image ${i + 1}`}
                    width={1200}
                    height={1500}
                    className="w-full h-auto block"
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
})

export default ProductImages
