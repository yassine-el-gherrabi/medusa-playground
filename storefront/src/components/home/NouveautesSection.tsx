"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
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
  const opt = product.options?.find((o) =>
    ["color", "couleur"].includes(o.title?.toLowerCase() || "")
  )
  if (opt?.values?.length) return opt.values.map((v) => ({ value: v.value, label: v.value }))
  // Fallback: product has no color option → default "Noir"
  return [{ value: "Noir", label: "Noir" }]
}

function extractSizes(product: Product): SizeOption[] {
  const opt = product.options?.find((o) =>
    ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || "")
  )
  return opt?.values?.map((v) => ({ value: v.value, label: v.value })) || []
}

function buildVariantMap(product: Product): VariantInfo[] {
  if (!product.variants) return []
  return product.variants.map((v) => {
    const opts: Record<string, string> = {}
    v.options?.forEach((o) => { opts[o.option?.title?.toLowerCase() || o.option_id || ""] = o.value })
    return {
      id: v.id,
      color: opts["color"] || opts["couleur"] || "Noir",
      size: opts["size"] || opts["taille"] || opts["pointure"] || "",
      inStock: (v.inventory_quantity ?? 1) > 0,
    }
  })
}

function findVariantId(variants: VariantInfo[], color: string, size: string): string | null {
  // Try exact match first
  const exact = variants.find((v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase())
  if (exact) return exact.id
  // Fallback: match by size only (for products without real color option)
  const bySize = variants.find((v) => v.size.toLowerCase() === size.toLowerCase())
  return bySize?.id ?? variants[0]?.id ?? null
}

function isSizeInStock(variants: VariantInfo[], color: string, size: string): boolean {
  const match = variants.find((v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase())
  if (match) return match.inStock
  // Fallback by size only
  const bySize = variants.find((v) => v.size.toLowerCase() === size.toLowerCase())
  return bySize?.inStock ?? false
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
    "Shirts": "HAUT", "Sweatshirts": "SWEATSHIRT", "Merch": "MERCH", "Pants": "BAS",
  }
  return map[cats[0].name] || cats[0].name.toUpperCase()
}

function getProductMeta(product: Product) {
  const meta = (product.metadata as Record<string, unknown>) || {}
  return { compareAtPrice: (meta.compare_at_price as number) || null }
}

function colorToCSS(name: string): string {
  const map: Record<string, string> = {
    noir: "#000", black: "#000", blanc: "#fff", white: "#fff", gris: "#888", grey: "#888",
    bleu: "#3b82f6", blue: "#3b82f6", violet: "#7c3aed", purple: "#7c3aed",
    vert: "#22c55e", green: "#22c55e", beige: "#d4b896", rouge: "#ef4444", red: "#ef4444",
    "noir v2": "#111", "noir/gris": "#444",
  }
  return map[name.toLowerCase()] || "#000"
}

// ── Product Card ──

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  const colors = extractColors(product)
  const sizes = extractSizes(product)
  const variants = buildVariantMap(product)
  const colorImages = getColorImages(product)
  const hasVariants = sizes.length > 0
  const categoryLabel = getCategoryLabel(product)
  const meta = getProductMeta(product)

  const [hovered, setHovered] = useState(false)
  const [activeColor, setActiveColor] = useState(colors[0]?.value || "Noir")
  const [sizesOpen, setSizesOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetColor, setSheetColor] = useState(colors[0]?.value || "")
  const [sheetSize, setSheetSize] = useState("")

  const activeImage = getImageForColor(product, colorImages, activeColor)
  const hoverImage = getSecondImage(product, colorImages, activeColor)
  const fallbackImage = product.thumbnail || product.images?.[0]?.url || ""
  const displayImage = activeImage || fallbackImage

  const priceData = getProductPrice(product)
  const priceLabel = priceData ? formatPrice(priceData.amount, priceData.currencyCode) : ""
  const compareLabel = meta.compareAtPrice && priceData ? formatPrice(meta.compareAtPrice, priceData.currencyCode) : null

  const productUrl = `/products/${product.handle}`

  // Color chevrons
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

  const [cardHovered, setCardHovered] = useState(false)

  const handleMouseEnterCard = () => setCardHovered(true)

  const handleMouseLeave = () => {
    setCardHovered(false)
    setSizesOpen(false)
    setSelectedSize(null)
  }

  // Add to cart flow
  const handleAddToCart = useCallback(async () => {
    if (!hasVariants) {
      // No sizes: direct add
      const variantId = product.variants?.[0]?.id
      if (!variantId) return
      setAdding(true)
      try { await addItem(variantId, 1) } catch { /* */ } finally { setAdding(false) }
      // Cart drawer opens via CartProvider
      return
    }

    if (!sizesOpen) {
      setSizesOpen(true)
      setSelectedSize(null)
      return
    }

    if (!selectedSize) return

    const variantId = findVariantId(variants, activeColor, selectedSize)
    if (!variantId) return

    setAdding(true)
    try {
      await addItem(variantId, 1)
      // Reset to initial state — cart drawer opens automatically
      setSizesOpen(false)
      setSelectedSize(null)
    } catch { /* */ }
    finally { setAdding(false) }
  }, [hasVariants, sizesOpen, selectedSize, activeColor, variants, product.variants, addItem])

  const buttonLabel = adding
    ? "Ajout..."
    : sizesOpen && !selectedSize
      ? "Sélectionnez une taille"
      : "Ajouter au panier"

  const buttonDisabled = adding || (sizesOpen && !selectedSize)

  return (
    <div
      className="flex-shrink-0 w-[calc(100%/2.09)] md:w-[calc(100%/3.33)] lg:w-[calc(100%/4.44)] xl:w-[calc(100%/5.33)]"
      onMouseEnter={handleMouseEnterCard}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Image area ── */}
      <div className="relative">
        <Link
          href={productUrl}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="block bg-[#f5f5f5] aspect-[3/4] relative overflow-hidden"
        >
          <Image src={displayImage} alt={product.title} fill
            className="object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: hovered && hoverImage ? 0 : 1 }}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            loading="lazy" />
          {hoverImage && hoverImage !== displayImage && (
            <Image src={hoverImage} alt={`${product.title} - vue 2`} fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              style={{ opacity: hovered ? 1 : 0 }}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              loading="lazy" />
          )}
        </Link>

        {/* Mobile "+" quick-add — no background, just the cross */}
        <button
          type="button"
          onClick={() => { setSheetOpen(true); setSheetColor(activeColor || colors[0]?.value || ""); setSheetSize("") }}
          className="md:hidden absolute bottom-2 right-2 z-10 p-2 cursor-pointer"
          aria-label="Ajout rapide"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <line x1="6" y1="0.5" x2="6" y2="11.5" stroke="black" strokeWidth="0.75" />
            <line x1="0.5" y1="6" x2="11.5" y2="6" stroke="black" strokeWidth="0.75" />
          </svg>
        </button>
      </div>

      {/* Mobile bottom sheet — Portal to escape transform containing block */}
      {sheetOpen && typeof document !== "undefined" && createPortal(
        <>
          <div className="md:hidden fixed inset-0 z-[100] bg-black/50" onClick={() => setSheetOpen(false)} />
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="p-6">
              {/* Handle bar */}
              <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-border rounded-full" /></div>

              {/* Header: title + price + close */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-sm font-medium">{product.title}</h3>
                  {priceLabel && <p className="text-sm text-muted-foreground mt-1">{priceLabel}</p>}
                </div>
                <button onClick={() => setSheetOpen(false)} className="p-2 -mr-2 -mt-1 cursor-pointer" aria-label="Fermer">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
              </div>

              {/* Product images — horizontal scroll gallery */}
              {(() => {
                const currentColorImages = colorImages[sheetColor] || colorImages[colors[0]?.value || ""] || []
                const allImages = currentColorImages.length > 0
                  ? currentColorImages
                  : (product.images || []).map((img) => ({ url: img.url }))
                return allImages.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 -mx-6 px-6" style={{ scrollbarWidth: "none" }}>
                    {allImages.map((img, i) => (
                      <div key={i} className="shrink-0 w-[120px] aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden rounded">
                        <Image src={img.url} alt={`${product.title} ${i + 1}`} fill className="object-cover" sizes="120px" />
                      </div>
                    ))}
                  </div>
                ) : null
              })()}

              {/* Color selector — rectangular bars like desktop */}
              {colors.length > 1 && (
                <div className="mb-5">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                    Couleur — {sheetColor}
                  </p>
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button key={c.value} onClick={() => { setSheetColor(c.value); setSheetSize("") }}
                        className="shrink-0 flex flex-col items-center gap-[3px] cursor-pointer" aria-label={c.label}>
                        <span
                          className={`block w-12 h-[12px] border transition-all ${
                            sheetColor === c.value ? "border-black/50" : "border-black/15"
                          }`}
                          style={{ backgroundColor: colorToCSS(c.value) }}
                        />
                        <span className={`block h-px w-full transition-all duration-200 ${
                          sheetColor === c.value ? "bg-black" : "bg-transparent"
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector — large touch targets */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Taille</p>
                  <div className="flex flex-wrap gap-4">
                    {sizes.map((s) => {
                      const inStock = isSizeInStock(variants, sheetColor || colors[0]?.value || "", s.value)
                      const isSelected = sheetSize === s.value
                      return (
                        <button key={s.value} onClick={() => inStock && setSheetSize(s.value)} disabled={!inStock}
                          className={`relative text-sm pb-1 transition-colors cursor-pointer ${
                            isSelected ? "text-foreground font-medium"
                            : inStock ? "text-muted-foreground"
                            : "text-black/20 line-through cursor-not-allowed"
                          }`}>
                          {s.label}
                          <span className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-200 ${
                            isSelected ? "bg-black" : "bg-transparent"
                          }`} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Add to bag */}
              <button
                onClick={async () => {
                  const color = sheetColor || colors[0]?.value || ""
                  const variantId = sizes.length > 0
                    ? findVariantId(variants, color, sheetSize)
                    : product.variants?.[0]?.id || null
                  if (!variantId) return
                  setAdding(true)
                  try { await addItem(variantId, 1); setSheetOpen(false) }
                  catch { /* */ } finally { setAdding(false) }
                }}
                disabled={adding || (sizes.length > 0 && !sheetSize)}
                className={`w-full h-[52px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer ${
                  adding || (sizes.length > 0 && !sheetSize)
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-foreground text-background"
                }`}
              >
                {adding ? "Ajout..." : sizes.length > 0 && !sheetSize ? "Sélectionnez une taille" : "Ajouter au panier"}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ── Product info ── */}
      <div className="pt-4 md:pt-5 px-[10px] lg:px-[14px]">

        {/* ── MOBILE: simplified — title + price + color count. Tap = PDP ── */}
        <div className="md:hidden">
          <Link href={productUrl} className="block">
            <h3 className="text-[12px] font-medium leading-tight tracking-[0.02em] line-clamp-2">{product.title}</h3>
          </Link>
          <div className="flex items-baseline gap-2 mt-1">
            {priceLabel && <span className="text-[12px] tracking-[0.03em]">{priceLabel}</span>}
            {compareLabel && <span className="text-[11px] text-muted-foreground line-through">{compareLabel}</span>}
          </div>
          {colors.length > 1 && (
            <p className="text-[10px] text-muted-foreground mt-1">+ {colors.length} couleurs</p>
          )}
        </div>

        {/* ── DESKTOP: full card — category, title, price, color bars, quick-add ── */}
        <div className="hidden md:block">
          {/* Category label */}
          {categoryLabel && (
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              {categoryLabel}
            </p>
          )}

          {/* Title */}
          <Link href={productUrl} className="block mt-1.5">
            <h3 className={`text-[13px] font-medium leading-tight tracking-[0.02em] line-clamp-2 transition-colors duration-200 ${cardHovered ? "text-black/60" : "text-foreground"}`}>{product.title}</h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1.5">
            {priceLabel && <span className="text-[12px] tracking-[0.03em]">{priceLabel}</span>}
            {compareLabel && <span className="text-[11px] text-muted-foreground line-through tracking-[0.03em]">{compareLabel}</span>}
          </div>

          {/* Color bars + chevrons */}
          <div className="flex items-center gap-2 mt-3">
            <div
              ref={colorScrollRef}
              onScroll={checkColorScroll}
              className="flex gap-[6px] overflow-x-auto scrollbar-hide flex-1 min-w-0"
              style={{ scrollbarWidth: "none" }}
            >
              {colors.map((c) => (
                <button key={c.value} type="button" onClick={() => setActiveColor(c.value)}
                  className="shrink-0 flex flex-col items-center gap-[3px] py-1 cursor-pointer"
                  style={{ width: "calc((100% - 24px) / 5)" }}
                  aria-label={c.label}>
                  <span className={`block w-full h-[10px] border transition-all ${
                    activeColor === c.value ? "border-black/50" : "border-black/15 hover:border-black/30"
                  }`} style={{ backgroundColor: colorToCSS(c.value) }} />
                  <span className={`block h-px w-full transition-all duration-200 ${
                    activeColor === c.value ? "bg-black" : "bg-transparent"
                  }`} />
                </button>
              ))}
            </div>

            {/* Chevrons — only for 6+ colors */}
            {colors.length > 5 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => scrollColors("left")} disabled={!canScrollLeft}
                  className={`transition-colors ${canScrollLeft ? "text-foreground" : "text-black/15"}`}
                  aria-label="Couleurs précédentes">
                  <svg width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M5.5 1L1.5 5l4 4" stroke="currentColor" strokeWidth="1" /></svg>
                </button>
                <button onClick={() => scrollColors("right")} disabled={!canScrollRight}
                  className={`transition-colors ${canScrollRight ? "text-foreground" : "text-black/15"}`}
                  aria-label="Couleurs suivantes">
                  <svg width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M1.5 1l4 4-4 4" stroke="currentColor" strokeWidth="1" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sizes + CTA — desktop only */}
        {sizesOpen && hasVariants && (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide mt-3 animate-fade-in" style={{ scrollbarWidth: "none" }}>
            {sizes.map((s) => {
              const inStock = isSizeInStock(variants, activeColor, s.value)
              const isSelected = selectedSize === s.value
              return (
                <button key={s.value} onClick={() => { if (inStock) setSelectedSize(s.value) }} disabled={!inStock}
                  className={`text-[12px] tracking-wide transition-all duration-150 relative pb-1 ${
                    isSelected ? "text-foreground font-medium cursor-pointer"
                    : inStock ? "text-muted-foreground hover:text-foreground cursor-pointer"
                    : "text-black/30 line-through cursor-not-allowed"
                  }`}
                  aria-label={inStock ? `Taille ${s.label}` : `Taille ${s.label} épuisée`}>
                  {s.label}
                  <span className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-200 ${
                    isSelected ? "bg-black" : "bg-transparent"
                  }`} />
                </button>
              )
            })}
          </div>
        )}

        {/* Add to cart CTA — desktop only */}
        <div className="hidden md:block">
          <div className="mt-3 mb-2">
            <button onClick={handleAddToCart} disabled={buttonDisabled}
              className={`text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 group/cta ${
                buttonDisabled
                  ? "text-black/45 cursor-not-allowed"
                  : "text-foreground cursor-pointer"
              }`}>
              <span className="relative inline-block">
                {buttonLabel}
                {/* Wipe underline effect — same as AnimatedLink */}
                {!buttonDisabled && (
                  <>
                    <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current origin-right transition-transform duration-300 group-hover/cta:scale-x-0" />
                    <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current scale-x-0 origin-left transition-transform duration-300 delay-200 group-hover/cta:scale-x-100" />
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
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