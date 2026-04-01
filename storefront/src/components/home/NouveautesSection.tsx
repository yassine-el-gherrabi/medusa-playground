"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/types"
import { getProductPrice, formatPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import AnimatedLink from "@/components/ui/AnimatedLink"

// ── Types & Helpers ──

type ColorOption = { value: string; label: string }
type SizeOption = { value: string; label: string }
type VariantInfo = { id: string; color: string; size: string; inStock: boolean }
type ColorImagesMap = Record<string, { url: string }[]>

function extractColors(product: Product): ColorOption[] {
  const opt = product.options?.find((o) => ["color", "couleur"].includes(o.title?.toLowerCase() || ""))
  return opt?.values?.map((v) => ({ value: v.value, label: v.value })) || []
}

function extractSizes(product: Product): SizeOption[] {
  const opt = product.options?.find((o) => ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || ""))
  return opt?.values?.map((v) => ({ value: v.value, label: v.value })) || []
}

function buildVariantMap(product: Product): VariantInfo[] {
  if (!product.variants) return []
  return product.variants.map((v) => {
    const opts: Record<string, string> = {}
    v.options?.forEach((o) => { opts[o.option?.title?.toLowerCase() || o.option_id || ""] = o.value })
    return {
      id: v.id,
      color: opts["color"] || opts["couleur"] || "",
      size: opts["size"] || opts["taille"] || opts["pointure"] || "",
      inStock: (v.inventory_quantity ?? 1) > 0,
    }
  })
}

function findVariantId(variants: VariantInfo[], color: string, size: string): string | null {
  return variants.find((v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase())?.id ?? null
}

function isSizeInStock(variants: VariantInfo[], color: string, size: string): boolean {
  return variants.find((v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase())?.inStock ?? false
}

function getColorImages(product: Product): ColorImagesMap {
  return ((product.metadata as Record<string, unknown> | null)?.color_images as ColorImagesMap) || {}
}

function getImageForColor(product: Product, ci: ColorImagesMap, color: string): string {
  return ci[color]?.[0]?.url || product.thumbnail || product.images?.[0]?.url || ""
}

function getSecondImage(product: Product, ci: ColorImagesMap, color: string): string {
  return ci[color]?.[1]?.url || product.images?.[1]?.url || ""
}

function getCategoryLabel(product: Product): string {
  const cats = (product as unknown as Record<string, unknown>).categories as { name: string }[] | undefined
  if (!cats?.[0]?.name) return ""
  const map: Record<string, string> = {
    "Hauts": "HAUT", "Bas": "BAS", "Vestes & Manteaux": "VESTE", "Casquettes": "CASQUETTE",
    "Lunettes de soleil": "LUNETTES", "Cache-cou": "CACHE-COU", "Vêtements": "VÊTEMENT",
    "Accessoires": "ACCESSOIRE", "Chaussures": "CHAUSSURES", "Ice for Girls": "ICE FOR GIRLS",
  }
  return map[cats[0].name] || cats[0].name.toUpperCase()
}

function getProductMeta(product: Product) {
  const meta = (product.metadata as Record<string, unknown>) || {}
  return { isSoldOut: !!meta.is_sold_out, compareAtPrice: (meta.compare_at_price as number) || null }
}

function colorToCSS(name: string): string {
  const map: Record<string, string> = {
    noir: "#000", black: "#000", blanc: "#fff", white: "#fff", gris: "#888", grey: "#888",
    bleu: "#3b82f6", blue: "#3b82f6", violet: "#7c3aed", purple: "#7c3aed",
    vert: "#22c55e", green: "#22c55e", beige: "#d4b896", rouge: "#ef4444", red: "#ef4444",
    "noir v2": "#111", "noir/gris": "#444",
  }
  return map[name.toLowerCase()] || name.toLowerCase()
}

// ── Product Card ──

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  const colors = extractColors(product)
  const sizes = extractSizes(product)
  const variants = buildVariantMap(product)
  const colorImages = getColorImages(product)
  const hasColors = colors.length > 1
  const hasVariants = sizes.length > 0
  const categoryLabel = getCategoryLabel(product)
  const meta = getProductMeta(product)

  const [hovered, setHovered] = useState(false)
  const [activeColor, setActiveColor] = useState(colors[0]?.value || "")
  const [sizesOpen, setSizesOpen] = useState(false)
  const [addingSize, setAddingSize] = useState<string | null>(null)
  const [addedSize, setAddedSize] = useState<string | null>(null)

  const activeImage = getImageForColor(product, colorImages, activeColor)
  const hoverImage = getSecondImage(product, colorImages, activeColor)
  const fallbackImage = product.thumbnail || product.images?.[0]?.url || ""
  const displayImage = activeImage || fallbackImage

  const priceData = getProductPrice(product)
  const priceLabel = priceData ? formatPrice(priceData.amount, priceData.currencyCode) : ""
  const compareLabel = meta.compareAtPrice && priceData ? formatPrice(meta.compareAtPrice, priceData.currencyCode) : null
  const discountPct = meta.compareAtPrice && priceData ? Math.round((1 - priceData.amount / meta.compareAtPrice) * 100) : null

  const productUrl = `/products/${product.handle}`

  // Color overflow detection
  const colorScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = colorScrollRef.current
    if (!el) return
    setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 2)
  }, [])

  useEffect(() => { checkScroll() }, [colors, checkScroll])

  const scrollColorsRight = () => {
    const el = colorScrollRef.current
    if (!el) return
    el.scrollBy({ left: 80, behavior: "smooth" })
    setTimeout(checkScroll, 300)
  }

  // Quick-add
  const handleAddSize = useCallback(async (size: string) => {
    const color = activeColor || colors[0]?.value || ""
    const variantId = findVariantId(variants, color, size)
    if (!variantId) return
    setAddingSize(size)
    try {
      await addItem(variantId, 1)
      setAddingSize(null); setAddedSize(size)
      setTimeout(() => { setAddedSize(null); setSizesOpen(false) }, 1200)
    } catch { setAddingSize(null) }
  }, [activeColor, colors, variants, addItem])

  // Direct add for no-size products
  const handleDirectAdd = useCallback(async () => {
    const variantId = product.variants?.[0]?.id
    if (!variantId) return
    setAddingSize("direct")
    try {
      await addItem(variantId, 1)
      setAddingSize(null); setAddedSize("direct")
      setTimeout(() => setAddedSize(null), 1200)
    } catch { setAddingSize(null) }
  }, [product.variants, addItem])

  return (
    <div className="flex-shrink-0 w-[calc(100%/2.09)] md:w-[calc(100%/3.33)] lg:w-[calc(100%/4.44)] xl:w-[calc(100%/5.33)]">
      {/* ── Image ── */}
      <Link
        href={productUrl}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`block bg-[#f5f5f5] aspect-[3/4] relative overflow-hidden ${meta.isSoldOut ? "opacity-70" : ""}`}
      >
        <Image
          src={displayImage}
          alt={product.title}
          fill
          className="object-cover transition-opacity duration-500 ease-in-out"
          style={{ opacity: hovered && hoverImage ? 0 : 1 }}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          loading="lazy"
        />
        {hoverImage && hoverImage !== displayImage && (
          <Image
            src={hoverImage}
            alt={`${product.title} - vue 2`}
            fill
            className="object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: hovered ? 1 : 0 }}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            loading="lazy"
          />
        )}
        {meta.isSoldOut && (
          <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] font-medium text-black/50">
            Épuisé
          </span>
        )}
      </Link>

      {/* ── Product info ── */}
      <div className="pt-4 px-[10px] lg:px-[14px]">
        {/* Row 1: Category (left) + Price (right) */}
        <div className="flex items-baseline justify-between gap-2">
          {categoryLabel ? (
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{categoryLabel}</span>
          ) : <span />}
          <div className="flex items-baseline gap-1.5 shrink-0">
            {priceLabel && <span className="text-[12px] tracking-[0.03em]">{priceLabel}</span>}
            {compareLabel && <span className="text-[11px] text-muted-foreground line-through tracking-[0.03em]">{compareLabel}</span>}
            {discountPct != null && discountPct > 0 && <span className="text-[10px] text-muted-foreground tracking-[0.05em]">-{discountPct}%</span>}
          </div>
        </div>

        {/* Row 2: Title */}
        <Link href={productUrl} className="block mt-1">
          <h3 className="text-[12px] font-medium leading-tight tracking-[0.02em] line-clamp-2">{product.title}</h3>
        </Link>

        {/* Row 3: Color bars — single chevron right, last color partially visible */}
        {hasColors && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {/* Scrollable color bars with fade mask when overflowing */}
            <div className="relative flex-1 min-w-0">
              <div
                ref={colorScrollRef}
                onScroll={checkScroll}
                className="flex gap-[6px] overflow-x-auto scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  maskImage: canScrollRight ? "linear-gradient(to right, black 80%, transparent 100%)" : undefined,
                  WebkitMaskImage: canScrollRight ? "linear-gradient(to right, black 80%, transparent 100%)" : undefined,
                }}
              >
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setActiveColor(c.value)}
                    className="shrink-0 flex flex-col items-center gap-[3px]"
                    aria-label={c.label}
                  >
                    <span
                      className={`block w-10 h-[10px] border transition-all ${
                        activeColor === c.value ? "border-black/30" : "border-black/10 hover:border-black/25"
                      }`}
                      style={{ backgroundColor: colorToCSS(c.value) }}
                    />
                    <span className={`block h-px w-full transition-all duration-200 ${
                      activeColor === c.value ? "bg-black" : "bg-transparent"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Single chevron right — only when more colors to see */}
            {canScrollRight && (
              <button
                onClick={scrollColorsRight}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Plus de couleurs"
              >
                <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
                  <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="0.75" />
                </svg>
              </button>
            )}

            {/* Active color name */}
            <span className="text-[10px] text-muted-foreground tracking-[0.05em] shrink-0">
              {activeColor}
            </span>
          </div>
        )}

        {/* Row 4: Quick-add — "Ajouter au panier" button + size chips */}
        {!meta.isSoldOut && (
          <div className="mt-3">
            {!sizesOpen ? (
              <button
                onClick={() => {
                  if (!hasVariants) handleDirectAdd()
                  else setSizesOpen(true)
                }}
                className={`text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  addedSize === "direct"
                    ? "text-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {addedSize === "direct" ? "✓ Ajouté" : "Ajouter au panier"}
              </button>
            ) : (
              /* Size chips — inline below colors */
              <div className="animate-fade-in">
                <div className="flex gap-[3px] overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                  {sizes.map((s) => {
                    const inStock = isSizeInStock(variants, activeColor, s.value)
                    const isAdding = addingSize === s.value
                    const isAdded = addedSize === s.value
                    return (
                      <button
                        key={s.value}
                        onClick={() => { if (inStock && !isAdding) handleAddSize(s.value) }}
                        disabled={!inStock || isAdding}
                        className={`shrink-0 h-7 min-w-[1.75rem] px-1.5 text-[10px] tracking-wide border transition-all duration-150 ${
                          isAdded
                            ? "bg-black text-white border-black"
                            : inStock
                              ? "border-black/20 text-black hover:border-black bg-transparent"
                              : "border-black/10 text-black/25 line-through cursor-not-allowed"
                        }`}
                        aria-label={inStock ? `Ajouter taille ${s.label}` : `Taille ${s.label} épuisée`}
                      >
                        {isAdded ? "✓" : s.label}
                      </button>
                    )
                  })}
                </div>
                {/* Close sizes */}
                <button
                  onClick={() => setSizesOpen(false)}
                  className="text-[9px] text-muted-foreground hover:text-foreground mt-1.5 uppercase tracking-[0.1em]"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Section ──

export default function NouveautesSection({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  if (products.length === 0) return null

  return (
    <section ref={sectionRef} className="bg-white">
      <div className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="flex items-end justify-between px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-10">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">Nouveautés</h2>
          <AnimatedLink href="/boutique" className="text-xs font-medium uppercase tracking-[0.2em] hidden md:inline-flex">Voir tout</AnimatedLink>
        </div>

        <div className="flex gap-[1px] overflow-x-auto scroll-smooth scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        <div className="px-6 md:px-10 pb-14 md:pb-20 md:hidden pt-6">
          <AnimatedLink href="/boutique" className="text-xs font-medium uppercase tracking-[0.2em]">Voir toutes les nouveautés</AnimatedLink>
        </div>
        <div className="pb-6 md:pb-10 hidden md:block" />
      </div>
    </section>
  )
}
