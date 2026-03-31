"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import { getProductPrice, formatPrice } from "@/lib/utils"
import AnimatedLink from "@/components/ui/AnimatedLink"

/* ─── Demo data — Medusa placeholder images (neutral grey backgrounds) ─── */

const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    title: "Medusa T-Shirt",
    handle: "medusa-t-shirt",
    thumbnail:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
    thumbnailAlt:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
    price: "10,00\u00a0€",
    colorName: "Black",
    colorCount: 2,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "demo-2",
    title: "Medusa Sweatshirt",
    handle: "medusa-sweatshirt",
    thumbnail:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
    thumbnailAlt:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
    price: "10,00\u00a0€",
    colorName: "Vintage",
    colorCount: 1,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "demo-3",
    title: "Medusa Sweatpants",
    handle: "medusa-sweatpants",
    thumbnail:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
    thumbnailAlt:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
    price: "10,00\u00a0€",
    colorName: "Gray",
    colorCount: 1,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "demo-4",
    title: "Medusa Shorts",
    handle: "medusa-shorts",
    thumbnail:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
    thumbnailAlt:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
    price: "10,00\u00a0€",
    colorName: "White",
    colorCount: 2,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "demo-5",
    title: "Medusa Longsleeve",
    handle: "medusa-longsleeve",
    thumbnail:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
    thumbnailAlt:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
    price: "29,99\u00a0€",
    colorName: "Black",
    colorCount: 3,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "demo-6",
    title: "Medusa Hoodie",
    handle: "medusa-hoodie",
    thumbnail:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
    thumbnailAlt:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
    price: "59,99\u00a0€",
    colorName: "Vintage",
    colorCount: 2,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "demo-7",
    title: "Medusa Tank Top",
    handle: "medusa-tank-top",
    thumbnail:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
    thumbnailAlt:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
    price: "19,99\u00a0€",
    colorName: "White",
    colorCount: 1,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "demo-8",
    title: "Medusa Joggers",
    handle: "medusa-joggers",
    thumbnail:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
    thumbnailAlt:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
    price: "39,99\u00a0€",
    colorName: "Gray",
    colorCount: 2,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
]

/* ─── Helpers to extract data from Medusa products ─── */

function extractSizes(product: any): string[] {
  if (!product.options) return []
  const sizeOption = product.options.find(
    (o: any) =>
      o && (o.title?.toLowerCase() === "size" || o.title?.toLowerCase() === "taille")
  )
  if (sizeOption?.values?.length) {
    return sizeOption.values.map((v: any) => v.value)
  }
  return []
}

function extractColorInfo(product: any): { name: string; count: number } {
  if (!product.options) return { name: "", count: 0 }
  const colorOption = product.options.find(
    (o: any) =>
      o && (o.title?.toLowerCase() === "color" || o.title?.toLowerCase() === "couleur")
  )
  if (colorOption?.values?.length) {
    return { name: colorOption.values[0].value, count: colorOption.values.length }
  }
  return { name: "", count: 0 }
}

/* ─── Placeholder pool for crossfade when product has only 1 image ─── */
const MEDUSA_PLACEHOLDERS = [
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
  "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
]

/* ─── Product card — Represent CLO style ─── */

function ProductCard({ product, index, isDemo }: { product: any; index: number; isDemo: boolean }) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [sizesVisible, setSizesVisible] = useState(false)

  const thumbnail = product.thumbnail || product.images?.[0]?.url
  let thumbnailAlt =
    product.thumbnailAlt || product.images?.[1]?.url || thumbnail

  // If both images are the same, pick a different one from the placeholder pool
  if (thumbnailAlt === thumbnail) {
    const pool = MEDUSA_PLACEHOLDERS.filter((url) => url !== thumbnail)
    thumbnailAlt = pool[index % pool.length] || thumbnail
  }

  /* Price */
  let priceLabel = product.price || ""
  if (!isDemo) {
    const priceData = getProductPrice(product)
    if (priceData) priceLabel = formatPrice(priceData.amount, priceData.currencyCode)
  }

  /* Sizes — extract from Medusa options, fallback to default set */
  const DEFAULT_SIZES = ["S", "M", "L", "XL"]
  const sizes: string[] = isDemo
    ? product.sizes || DEFAULT_SIZES
    : extractSizes(product).length > 0
      ? extractSizes(product)
      : product.sizes || DEFAULT_SIZES

  /* Color */
  let colorName = product.colorName || ""
  let colorCount = product.colorCount || 0
  if (!isDemo) {
    const colorInfo = extractColorInfo(product)
    if (colorInfo.name) {
      colorName = colorInfo.name
      colorCount = colorInfo.count
    }
  }

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

export default function NouveautesSection() {
  const { region } = useRegion()
  const [products, setProducts] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
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
        fields:
          "id,title,handle,thumbnail,images,*variants.calculated_price,options,options.values",
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
        {!loaded ? (
          <div
            className="flex gap-[1px] overflow-hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[calc(100%/2.09)] md:w-[calc(100%/3.33)] lg:w-[calc(100%/4.44)] xl:w-[calc(100%/5.33)]"
              >
                <div className="bg-[#f7f7f7] aspect-[3/4] animate-shimmer rounded-none" />
                <div className="pt-4 px-[10px] lg:px-[14px] space-y-2">
                  <div className="h-3 w-3/4 animate-shimmer rounded" />
                  <div className="h-3 w-1/3 animate-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex gap-[1px] overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {data.map((product: any, idx: number) => (
              <ProductCard key={product.id} product={product} index={idx} isDemo={useDemo} />
            ))}
          </div>
        )}

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
