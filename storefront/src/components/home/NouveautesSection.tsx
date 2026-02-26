"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import { useCart } from "@/providers/cart"
import { formatPrice } from "@/lib/utils"
import AnimatedLink from "@/components/ui/AnimatedLink"

/* ─── Demo data — 8 products, 2 images each, studio bg ─── */

const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    title: "Hoodie Nebula Black",
    handle: "hoodie-nebula-black",
    color: "Noir",
    thumbnail:
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&q=80",
    thumbnailAlt:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
    variants: [
      { id: "v1-s", options: [{ value: "S" }], calculated_price: { calculated_amount: 89.99, currency_code: "eur" } },
      { id: "v1-m", options: [{ value: "M" }], calculated_price: { calculated_amount: 89.99, currency_code: "eur" } },
      { id: "v1-l", options: [{ value: "L" }], calculated_price: { calculated_amount: 89.99, currency_code: "eur" } },
      { id: "v1-xl", options: [{ value: "XL" }], calculated_price: { calculated_amount: 89.99, currency_code: "eur" } },
    ],
  },
  {
    id: "demo-2",
    title: "Cargo Pants Urban",
    handle: "cargo-pants-urban",
    color: "Kaki",
    thumbnail:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
    thumbnailAlt:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
    variants: [
      { id: "v2-28", options: [{ value: "28" }], calculated_price: { calculated_amount: 74.99, currency_code: "eur" } },
      { id: "v2-30", options: [{ value: "30" }], calculated_price: { calculated_amount: 74.99, currency_code: "eur" } },
      { id: "v2-32", options: [{ value: "32" }], calculated_price: { calculated_amount: 74.99, currency_code: "eur" } },
      { id: "v2-34", options: [{ value: "34" }], calculated_price: { calculated_amount: 74.99, currency_code: "eur" } },
    ],
  },
  {
    id: "demo-3",
    title: "Tee Oversize Ice Logo",
    handle: "tee-oversize-ice-logo",
    color: "Blanc",
    thumbnail:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    thumbnailAlt:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    variants: [
      { id: "v3-s", options: [{ value: "S" }], calculated_price: { calculated_amount: 44.99, currency_code: "eur" } },
      { id: "v3-m", options: [{ value: "M" }], calculated_price: { calculated_amount: 44.99, currency_code: "eur" } },
      { id: "v3-l", options: [{ value: "L" }], calculated_price: { calculated_amount: 44.99, currency_code: "eur" } },
    ],
  },
  {
    id: "demo-4",
    title: "Bomber Jacket Street",
    handle: "bomber-jacket-street",
    color: "Noir",
    thumbnail:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    thumbnailAlt:
      "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80",
    variants: [
      { id: "v4-s", options: [{ value: "S" }], calculated_price: { calculated_amount: 129.99, currency_code: "eur" } },
      { id: "v4-m", options: [{ value: "M" }], calculated_price: { calculated_amount: 129.99, currency_code: "eur" } },
      { id: "v4-l", options: [{ value: "L" }], calculated_price: { calculated_amount: 129.99, currency_code: "eur" } },
      { id: "v4-xl", options: [{ value: "XL" }], calculated_price: { calculated_amount: 129.99, currency_code: "eur" } },
    ],
  },
  {
    id: "demo-5",
    title: "Pantalon Technique Frost",
    handle: "pantalon-technique-frost",
    color: "Gris",
    thumbnail:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
    thumbnailAlt:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
    variants: [
      { id: "v5-s", options: [{ value: "S" }], calculated_price: { calculated_amount: 94.99, currency_code: "eur" } },
      { id: "v5-m", options: [{ value: "M" }], calculated_price: { calculated_amount: 94.99, currency_code: "eur" } },
      { id: "v5-l", options: [{ value: "L" }], calculated_price: { calculated_amount: 94.99, currency_code: "eur" } },
    ],
  },
  {
    id: "demo-6",
    title: "Veste Polaire Alpine",
    handle: "veste-polaire-alpine",
    color: "Marine",
    thumbnail:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    thumbnailAlt:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
    variants: [
      { id: "v6-m", options: [{ value: "M" }], calculated_price: { calculated_amount: 109.99, currency_code: "eur" } },
      { id: "v6-l", options: [{ value: "L" }], calculated_price: { calculated_amount: 109.99, currency_code: "eur" } },
      { id: "v6-xl", options: [{ value: "XL" }], calculated_price: { calculated_amount: 109.99, currency_code: "eur" } },
    ],
  },
  {
    id: "demo-7",
    title: "Sweat Crew Glacier",
    handle: "sweat-crew-glacier",
    color: "Blanc",
    thumbnail:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
    thumbnailAlt:
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=80",
    variants: [
      { id: "v7-s", options: [{ value: "S" }], calculated_price: { calculated_amount: 69.99, currency_code: "eur" } },
      { id: "v7-m", options: [{ value: "M" }], calculated_price: { calculated_amount: 69.99, currency_code: "eur" } },
      { id: "v7-l", options: [{ value: "L" }], calculated_price: { calculated_amount: 69.99, currency_code: "eur" } },
    ],
  },
  {
    id: "demo-8",
    title: "Doudoune Sans Manches Ice",
    handle: "doudoune-sans-manches-ice",
    color: "Noir",
    thumbnail:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
    thumbnailAlt:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    variants: [
      { id: "v8-s", options: [{ value: "S" }], calculated_price: { calculated_amount: 149.99, currency_code: "eur" } },
      { id: "v8-m", options: [{ value: "M" }], calculated_price: { calculated_amount: 149.99, currency_code: "eur" } },
      { id: "v8-l", options: [{ value: "L" }], calculated_price: { calculated_amount: 149.99, currency_code: "eur" } },
      { id: "v8-xl", options: [{ value: "XL" }], calculated_price: { calculated_amount: 149.99, currency_code: "eur" } },
    ],
  },
]

const COLOR_MAP: Record<string, string> = {
  Noir: "#1a1a1a",
  Blanc: "#f0f0f0",
  Kaki: "#5b6b4f",
  Gris: "#8c8c8c",
  Marine: "#1e2a3a",
}

/** Extract size label from a Medusa variant */
function getSizeLabel(variant: any): string {
  if (variant.options?.length) {
    const sizeOpt = variant.options.find(
      (o: any) =>
        o.option?.title?.toLowerCase() === "size" ||
        o.option?.title?.toLowerCase() === "taille" ||
        !o.option?.title
    )
    if (sizeOpt) return sizeOpt.value
    return variant.options[0].value
  }
  return variant.title || "?"
}

/* ─── Product card — Represent CLO exact match ─── */

function NouveauteCard({
  product,
  isDemo,
}: {
  product: any
  isDemo: boolean
}) {
  const { addItem } = useCart()

  // Image hover state (crossfade)
  const [imageHovered, setImageHovered] = useState(false)

  // Plus button & size overlay states with hover bridge
  const [plusHovered, setPlusHovered] = useState(false)
  const [sizeOverlayHovered, setSizeOverlayHovered] = useState(false)
  const [tapped, setTapped] = useState(false)

  // Cart action states
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)

  // Hover bridge timers
  const plusTimer = useRef<NodeJS.Timeout>(undefined)
  const sizeTimer = useRef<NodeJS.Timeout>(undefined)

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(plusTimer.current)
      clearTimeout(sizeTimer.current)
    }
  }, [])

  const showSizes = plusHovered || sizeOverlayHovered || tapped

  const thumbnail = product.thumbnail || product.images?.[0]?.url
  const thumbnailAlt = product.thumbnailAlt || product.images?.[1]?.url || thumbnail
  const variants = product.variants || []
  const price = variants[0]?.calculated_price
  const colorHex = COLOR_MAP[product.color] || "#1a1a1a"

  // Plus button hover bridge handlers
  const handlePlusEnter = useCallback(() => {
    clearTimeout(plusTimer.current)
    setPlusHovered(true)
  }, [])

  const handlePlusLeave = useCallback(() => {
    plusTimer.current = setTimeout(() => setPlusHovered(false), 150)
  }, [])

  // Size overlay hover bridge handlers
  const handleSizeOverlayEnter = useCallback(() => {
    clearTimeout(sizeTimer.current)
    clearTimeout(plusTimer.current)
    setSizeOverlayHovered(true)
  }, [])

  const handleSizeOverlayLeave = useCallback(() => {
    sizeTimer.current = setTimeout(() => setSizeOverlayHovered(false), 150)
  }, [])

  // Mobile tap toggle
  const handlePlusTap = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTapped((prev) => !prev)
  }, [])

  const handleAddToCart = useCallback(async (e: React.MouseEvent, variantId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (isDemo) {
      setAddedId(variantId)
      setTimeout(() => setAddedId(null), 1200)
      return
    }

    setAddingId(variantId)
    try {
      await addItem(variantId, 1)
      setAddedId(variantId)
      setTimeout(() => setAddedId(null), 1200)
    } catch (err) {
      console.error("Failed to add:", err)
    } finally {
      setAddingId(null)
    }
  }, [isDemo, addItem])

  return (
    <div className="flex-shrink-0 w-[47%] md:w-[31.5%] lg:w-[24%] xl:w-[19%]">
      {/* Image container — aspect 3:4, grey bg */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]"
        onMouseEnter={() => setImageHovered(true)}
        onMouseLeave={() => setImageHovered(false)}
      >
        <Link
          href={`/products/${product.handle}`}
          className="block absolute inset-0"
        >
          {/* Primary image */}
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={product.title}
              fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              style={{ opacity: imageHovered ? 0 : 1 }}
              sizes="(max-width: 640px) 47vw, (max-width: 768px) 31.5vw, (max-width: 1024px) 24vw, 19vw"
              loading="lazy"
            />
          )}
          {/* Secondary image (hover crossfade) */}
          {thumbnailAlt && (
            <Image
              src={thumbnailAlt}
              alt={`${product.title} - vue 2`}
              fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              style={{ opacity: imageHovered ? 1 : 0 }}
              sizes="(max-width: 640px) 47vw, (max-width: 768px) 31.5vw, (max-width: 1024px) 24vw, 19vw"
              loading="lazy"
            />
          )}
          {!thumbnail && <div className="absolute inset-0 bg-[#f5f5f5]" />}
        </Link>

        {/* Size selector overlay — bottom of image, appears on hover bridge */}
        {variants.length > 0 && (
          <div
            className="absolute inset-x-0 bottom-0 z-20 transition-opacity duration-200"
            style={{
              opacity: showSizes ? 1 : 0,
              pointerEvents: showSizes ? "auto" : "none",
            }}
            onMouseEnter={handleSizeOverlayEnter}
            onMouseLeave={handleSizeOverlayLeave}
          >
            <div className="bg-[#f0f0f0]/90 backdrop-blur-[2px] px-3 py-3">
              <div className="flex flex-wrap gap-[5px] justify-center">
                {variants.map((v: any) => {
                  const label = getSizeLabel(v)
                  const isAdding = addingId === v.id
                  const isAdded = addedId === v.id
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => handleAddToCart(e, v.id)}
                      disabled={isAdding}
                      className={`w-10 h-10 text-[10px] font-normal tracking-wide
                                 outline outline-1 transition-all duration-150
                                 ${
                                   isAdded
                                     ? "bg-foreground text-white outline-foreground"
                                     : "bg-white outline-[#cacaca] hover:outline-foreground"
                                 }`}
                    >
                      {isAdded ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3.5 h-3.5 mx-auto"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      ) : isAdding ? (
                        <span className="block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        label
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action row: color dot + "+" button */}
      <div className="flex items-center justify-between px-3.5 pt-2.5">
        <span
          className="w-[10px] h-[10px] rounded-full"
          style={{ backgroundColor: colorHex }}
        />
        <button
          className="text-[15px] leading-none text-foreground select-none"
          onMouseEnter={handlePlusEnter}
          onMouseLeave={handlePlusLeave}
          onTouchStart={handlePlusTap}
          aria-label={`Choisir taille pour ${product.title}`}
        >
          +
        </button>
      </div>

      {/* Info row: title + price */}
      <div className="flex items-start justify-between gap-4 px-3.5 pt-1.5 pb-1">
        <Link
          href={`/products/${product.handle}`}
          className="min-w-0"
        >
          <h3 className="text-xs font-medium text-foreground truncate">
            {product.title}
          </h3>
        </Link>
        {price && (
          <span className="text-xs font-normal text-foreground whitespace-nowrap">
            {formatPrice(price.calculated_amount, price.currency_code)}
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── Main section — flush with hero, no title, no spacing ─── */

export default function NouveautesSection() {
  const { region } = useRegion()
  const [products, setProducts] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!region?.id) {
      setLoaded(true)
      return
    }
    sdk.store.product
      .list({
        limit: 10,
        order: "-created_at",
        region_id: region.id,
        fields: "*variants,*variants.calculated_price,*variants.options",
      })
      .then(({ products }) => {
        setProducts(products)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [region?.id])

  const useDemo = loaded && products.length === 0
  const data = useDemo ? DEMO_PRODUCTS : products

  return (
    <section>
      {/* Horizontal scroll strip — edge-to-edge, 1px gap */}
      <div className="flex gap-[1px] overflow-x-auto scrollbar-hide">
        {data.map((product: any) => (
          <NouveauteCard
            key={product.id}
            product={product}
            isDemo={useDemo}
          />
        ))}
      </div>

      {/* Centered link below strip */}
      <div className="flex justify-center py-8">
        <AnimatedLink
          href="/boutique"
          className="text-xs uppercase tracking-[0.2em]"
        >
          Shop all nouveautes
        </AnimatedLink>
      </div>
    </section>
  )
}
