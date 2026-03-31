"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Product } from "@/types"
import { getProductPrice, formatPrice } from "@/lib/utils"
import AnimatedLink from "@/components/ui/AnimatedLink"

/* ─── Helpers to extract data from Medusa products ─── */

function extractSizes(product: Product): string[] {
  if (!product.options) return []
  const sizeOption = product.options.find(
    (o) =>
      o && (o.title?.toLowerCase() === "size" || o.title?.toLowerCase() === "taille")
  )
  if (sizeOption?.values?.length) {
    return sizeOption.values.map((v) => v.value)
  }
  return []
}

function extractColorInfo(product: Product): { name: string; count: number } {
  if (!product.options) return { name: "", count: 0 }
  const colorOption = product.options.find(
    (o) =>
      o && (o.title?.toLowerCase() === "color" || o.title?.toLowerCase() === "couleur")
  )
  if (colorOption?.values?.length) {
    return { name: colorOption.values[0].value, count: colorOption.values.length }
  }
  return { name: "", count: 0 }
}

/* ─── Product card — Represent CLO style ─── */

function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [sizesVisible, setSizesVisible] = useState(false)

  const thumbnail = product.thumbnail || product.images?.[0]?.url
  const thumbnailAlt = product.images?.[1]?.url || thumbnail

  /* Price */
  let priceLabel = ""
  const priceData = getProductPrice(product)
  if (priceData) priceLabel = formatPrice(priceData.amount, priceData.currencyCode)

  /* Sizes — extract from Medusa options */
  const sizes: string[] = extractSizes(product)

  /* Color */
  const colorInfo = extractColorInfo(product)
  const colorName = colorInfo.name
  const colorCount = colorInfo.count

  const productUrl = `/products/${product.handle}`

  return (
    <div
      className="flex-shrink-0 w-[calc(100%/2.09)] md:w-[calc(100%/3.33)] lg:w-[calc(100%/4.44)] xl:w-[calc(100%/5.33)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setSizesVisible(false) }}
    >
      {/* Image — 3:4, crossfade hover, "+" inside image, size overlay on hover */}
      <div className="relative overflow-hidden">
        <Link
          href={productUrl}
          className="block bg-[#f7f7f7] aspect-[3/4] relative overflow-hidden"
        >
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={product.title}
              fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              style={{ opacity: hovered && !sizesVisible ? 0 : 1 }}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              loading="lazy"
            />
          )}
          {thumbnailAlt && thumbnailAlt !== thumbnail && (
            <Image
              src={thumbnailAlt}
              alt={`${product.title} - vue 2`}
              fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              style={{ opacity: hovered && !sizesVisible ? 1 : 0 }}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              loading="lazy"
            />
          )}
        </Link>

        {/* "+/×" toggle — rotates 45° to become an X when sizes are visible */}
        {sizes.length > 0 && (
          <div className="absolute bottom-0 right-0 z-30">
            <button
              type="button"
              onMouseEnter={() => { if (!sizesVisible) setSizesVisible(true) }}
              onTouchStart={(e) => { e.preventDefault(); setSizesVisible(!sizesVisible) }}
              onClick={() => { if (sizesVisible) setSizesVisible(false) }}
              className="p-[10px] lg:px-[13px] lg:py-[15px]"
              aria-label={sizesVisible ? "Masquer les tailles" : "Afficher les tailles"}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 ease-out"
                style={{ transform: sizesVisible ? "rotate(45deg)" : "rotate(0deg)" }}
              >
                <line x1="5.625" y1="0" x2="5.625" y2="11.25" stroke="black" strokeWidth="0.75" />
                <line y1="5.625" x2="11.25" y2="5.625" stroke="black" strokeWidth="0.75" />
              </svg>
            </button>
          </div>
        )}

        {/* Size chips — appear at bottom of image on hover/tap, no background */}
        {sizes.length > 0 && (
          <div
            className={`absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end transition-opacity duration-300 ease-out ${
              sizesVisible
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex justify-center items-center p-3">
              <div
                className="flex flex-nowrap gap-[1px] overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => router.push(productUrl)}
                    className="shiny-btn shrink-0 h-9 min-w-[2.25rem] px-2.5 flex items-center justify-center border border-white/20 bg-black/15 backdrop-blur-md rounded-[2px] text-[10px] tracking-wide select-none"
                  >
                    <span className="shiny-text-bright">{size}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info — name + color (left), price (right) — like Represent desktop */}
      <div className="flex flex-col gap-1 pt-4 text-xs px-[10px] lg:px-[14px] lg:flex-row lg:justify-between lg:gap-4">
        <Link href={productUrl} className="flex flex-col gap-1 min-w-0">
          <h3 className="font-medium text-xs leading-tight">
            {product.title}
          </h3>
          <span className="text-neutral-500 text-xs leading-tight">
            {colorName && <span className="lowercase">{colorName}</span>}
            {colorCount > 1 && (
              <>
                {colorName && <span className="mx-1.5">&nbsp;</span>}
                <span>{colorCount} Couleurs</span>
              </>
            )}
          </span>
        </Link>

        <div className="flex-shrink-0">
          {priceLabel && (
            <span className="text-xs font-normal">
              {priceLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main section — Represent CLO product scroll ─── */

type NouveautesSectionProps = {
  products: Product[]
}

export default function NouveautesSection({ products }: NouveautesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

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

  if (products.length === 0) return null

  return (
    <section ref={sectionRef} className="bg-white">
      <div
        className={`transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Section heading */}
        <div className="flex items-end justify-between px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-10">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">
            Nouveautés
          </h2>
          <AnimatedLink
            href="/boutique"
            className="text-xs font-medium uppercase tracking-[0.2em] hidden md:inline-flex"
          >
            Voir tout
          </AnimatedLink>
        </div>

        {/* Horizontal product scroll — 1px gap like Represent CLO */}
        <div
          className="flex gap-[1px] overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile link */}
        <div className="px-6 md:px-10 pb-14 md:pb-20 md:hidden pt-6">
          <AnimatedLink
            href="/boutique"
            className="text-xs font-medium uppercase tracking-[0.2em]"
          >
            Voir toutes les nouveautés
          </AnimatedLink>
        </div>

        {/* Desktop bottom spacing */}
        <div className="pb-6 md:pb-10 hidden md:block" />
      </div>
    </section>
  )
}
