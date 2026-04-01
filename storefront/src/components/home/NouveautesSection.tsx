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
  const hasColors = colors.length > 0
  const hasMultipleColors = colors.length > 1
  const hasVariants = sizes.length > 0
  const categoryLabel = getCategoryLabel(product)
  const meta = getProductMeta(product)

  const [hovered, setHovered] = useState(false)
  const [activeColor, setActiveColor] = useState(colors[0]?.value || "")
  const [sizesOpen, setSizesOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const activeImage = getImageForColor(product, colorImages, activeColor)
  const hoverImage = getSecondImage(product, colorImages, activeColor)
  const fallbackImage = product.thumbnail || product.images?.[0]?.url || ""
  const displayImage = activeImage || fallbackImage

  const priceData = getProductPrice(product)
  const priceLabel = priceData ? formatPrice(priceData.amount, priceData.currencyCode) : ""
  const compareLabel = meta.compareAtPrice && priceData ? formatPrice(meta.compareAtPrice, priceData.currencyCode) : null
  const discountPct = meta.compareAtPrice && priceData ? Math.round((1 - priceData.amount / meta.compareAtPrice) * 100) : null

  const productUrl = `/products/${product.handle}`

  // ── Color chevrons ──
  const colorScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkColorScroll = useCallback(() => {
    const el = colorScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 2)
  }, [])

  useEffect(() => { checkColorScroll() }, [colors, checkColorScroll])

  const scrollColors = (dir: "left" | "right") => {
    const el = colorScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -80 : 80, behavior: "smooth" })
    setTimeout(checkColorScroll, 300)
  }

  // ── Quick-add: select size first, then confirm with "Ajouter au panier" ──
  const handleAddToCart = useCallback(async () => {
    if (!hasVariants) {
      // No-size product: direct add
      const variantId = product.variants?.[0]?.id
      if (!variantId) return
      setAdding(true)
      try {
        await addItem(variantId, 1)
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 2000) // 2s feedback
      } catch { /* cart provider handles */ }
      finally { setAdding(false) }
      return
    }

    if (!sizesOpen) {
      // First click: reveal sizes
      setSizesOpen(true)
      setSelectedSize(null)
      return
    }

    if (!selectedSize) return // no size selected yet

    // Add the selected size+color to cart
    const color = activeColor || colors[0]?.value || ""
    const variantId = findVariantId(variants, color, selectedSize)
    if (!variantId) return

    setAdding(true)
    try {
      await addItem(variantId, 1)
      setJustAdded(true)
      setSelectedSize(null) // reset selection for next add
      setTimeout(() => setJustAdded(false), 1500)
    } catch { /* cart provider handles */ }
    finally { setAdding(false) }
  }, [hasVariants, sizesOpen, selectedSize, activeColor, colors, variants, product.variants, addItem])

  // Button label logic
  const getButtonLabel = () => {
    if (adding) return "Ajout..."
    if (justAdded) return "✓ Ajouté"
    if (sizesOpen && !selectedSize) return "Sélectionnez une taille"
    return "Ajouter au panier"
  }

  const isButtonDisabled = adding || (sizesOpen && !selectedSize && !justAdded)

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
          src={displayImage} alt={product.title} fill
          className="object-cover transition-opacity duration-500 ease-in-out"
          style={{ opacity: hovered && hoverImage ? 0 : 1 }}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          loading="lazy"
        />
        {hoverImage && hoverImage !== displayImage && (
          <Image
            src={hoverImage} alt={`${product.title} - vue 2`} fill
            className="object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: hovered ? 1 : 0 }}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            loading="lazy"
          />
        )}
        {meta.isSoldOut && (
          <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] font-medium text-black/50">Épuisé</span>
        )}
      </Link>

      {/* ── Product info ── */}
      <div className="pt-4 px-[10px] lg:px-[14px]">
        {/* Row 1: Category + Price */}
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

        {/* Row 3: Color bars + count (no color name) */}
        {hasColors && (
          <div className="flex items-center mt-2.5">
            {/* Left chevron */}
            {hasMultipleColors && (
              <button
                onClick={() => scrollColors("left")}
                disabled={!canScrollLeft}
                className={`shrink-0 mr-1.5 transition-colors ${canScrollLeft ? "text-foreground" : "text-black/15"}`}
                aria-label="Couleurs précédentes"
              >
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                  <path d="M5 1L1 5l4 4" stroke="currentColor" strokeWidth="0.75" />
                </svg>
              </button>
            )}

            {/* Color bars */}
            <div
              ref={colorScrollRef}
              onScroll={checkColorScroll}
              className="flex gap-[6px] overflow-x-auto scrollbar-hide flex-1 min-w-0"
              style={{ scrollbarWidth: "none" }}
            >
              {colors.map((c) => (
                <button
                  key={c.value} type="button"
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

            {/* Right chevron */}
            {hasMultipleColors && (
              <button
                onClick={() => scrollColors("right")}
                disabled={!canScrollRight}
                className={`shrink-0 ml-1.5 transition-colors ${canScrollRight ? "text-foreground" : "text-black/15"}`}
                aria-label="Couleurs suivantes"
              >
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                  <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="0.75" />
                </svg>
              </button>
            )}

            {/* Count only — no color name */}
            {hasMultipleColors && (
              <span className="text-[10px] text-muted-foreground tracking-[0.05em] shrink-0 ml-2">
                {colors.length} couleurs
              </span>
            )}
          </div>
        )}

        {/* Row 4: Sizes (when open) */}
        {sizesOpen && hasVariants && (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide mt-2.5 animate-fade-in" style={{ scrollbarWidth: "none" }}>
            {sizes.map((s) => {
              const inStock = isSizeInStock(variants, activeColor, s.value)
              const isSelected = selectedSize === s.value
              return (
                <button
                  key={s.value}
                  onClick={() => { if (inStock) setSelectedSize(s.value) }}
                  disabled={!inStock}
                  className={`text-[11px] tracking-wide transition-all duration-150 relative pb-0.5 ${
                    isSelected
                      ? "text-foreground font-medium"
                      : inStock
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-black/20 line-through cursor-not-allowed"
                  }`}
                  aria-label={inStock ? `Taille ${s.label}` : `Taille ${s.label} épuisée`}
                >
                  {s.label}
                  {/* Underline on selected */}
                  <span className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-200 ${
                    isSelected ? "bg-black" : "bg-transparent"
                  }`} />
                </button>
              )
            })}
          </div>
        )}

        {/* Row 5: Add to cart button */}
        {!meta.isSoldOut && (
          <div className="mt-3 mb-2">
            <button
              onClick={handleAddToCart}
              disabled={isButtonDisabled && !justAdded}
              className={`text-[10px] uppercase tracking-[0.12em] transition-colors ${
                justAdded
                  ? "text-foreground"
                  : isButtonDisabled
                    ? "text-black/25 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {getButtonLabel()}
            </button>
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