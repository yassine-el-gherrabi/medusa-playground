"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/types"
import { getProductPrice, formatPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import AnimatedLink from "@/components/ui/AnimatedLink"

// ── Types ──

type ColorOption = { value: string; label: string }
type SizeOption = { value: string; label: string }
type VariantInfo = {
  id: string
  color: string
  size: string
  inStock: boolean
}

// color_images stored in product.metadata by the seed
type ColorImagesMap = Record<string, { url: string }[]>

// ── Helpers ──

function extractColors(product: Product): ColorOption[] {
  const opt = product.options?.find(
    (o) =>
      o.title?.toLowerCase() === "color" ||
      o.title?.toLowerCase() === "couleur"
  )
  return opt?.values?.map((v) => ({ value: v.value, label: v.value })) || []
}

function extractSizes(product: Product): SizeOption[] {
  const opt = product.options?.find(
    (o) =>
      o.title?.toLowerCase() === "size" ||
      o.title?.toLowerCase() === "taille" ||
      o.title?.toLowerCase() === "pointure"
  )
  return opt?.values?.map((v) => ({ value: v.value, label: v.value })) || []
}

function buildVariantMap(product: Product): VariantInfo[] {
  if (!product.variants) return []
  return product.variants.map((v) => {
    const opts: Record<string, string> = {}
    v.options?.forEach((o) => {
      const title = o.option?.title?.toLowerCase() || o.option_id || ""
      opts[title] = o.value
    })
    return {
      id: v.id,
      color: opts["color"] || opts["couleur"] || "",
      size: opts["size"] || opts["taille"] || opts["pointure"] || "",
      inStock: (v.inventory_quantity ?? 1) > 0,
    }
  })
}

function findVariantId(variants: VariantInfo[], color: string, size: string): string | null {
  return variants.find(
    (v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase()
  )?.id ?? null
}

function isSizeInStock(variants: VariantInfo[], color: string, size: string): boolean {
  return variants.find(
    (v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase()
  )?.inStock ?? false
}

/** Get color_images map from product metadata */
function getColorImages(product: Product): ColorImagesMap {
  const meta = product.metadata as Record<string, unknown> | null
  return (meta?.color_images as ColorImagesMap) || {}
}

/** Get image URL for a specific color, falling back to product thumbnail */
function getImageForColor(product: Product, colorImages: ColorImagesMap, color: string): string {
  const imgs = colorImages[color]
  if (imgs?.[0]?.url) return imgs[0].url
  return product.thumbnail || product.images?.[0]?.url || ""
}

/** Map color names to CSS-safe colors */
function colorToCSS(name: string): string {
  const map: Record<string, string> = {
    noir: "#000", black: "#000",
    blanc: "#fff", white: "#fff",
    gris: "#888", grey: "#888", gray: "#888",
    bleu: "#3b82f6", blue: "#3b82f6",
    violet: "#7c3aed", purple: "#7c3aed",
    vert: "#22c55e", green: "#22c55e",
    beige: "#d4b896",
    rouge: "#ef4444", red: "#ef4444",
    "noir v2": "#111", "noir/gris": "#444",
  }
  return map[name.toLowerCase()] || name.toLowerCase()
}

function useHasHover() {
  const [hasHover] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches
  })
  return hasHover
}

// ── Bottom Sheet (mobile) ──

function QuickAddBottomSheet({
  product,
  colors,
  sizes,
  variants,
  isOpen,
  onClose,
}: {
  product: Product
  colors: ColorOption[]
  sizes: SizeOption[]
  variants: VariantInfo[]
  isOpen: boolean
  onClose: () => void
}) {
  const { addItem } = useCart()
  const [selectedColor, setSelectedColor] = useState(colors[0]?.value || "")
  const [selectedSize, setSelectedSize] = useState("")
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const priceData = getProductPrice(product)

  const handleAdd = async () => {
    if (!selectedSize) return
    const variantId = findVariantId(variants, selectedColor, selectedSize)
    if (!variantId) return
    setAdding(true)
    try {
      await addItem(variantId, 1)
      setAdded(true)
      setTimeout(() => { onClose(); setAdded(false); setSelectedSize("") }, 600)
    } catch { /* cart provider handles */ } finally { setAdding(false) }
  }

  useEffect(() => {
    if (isOpen) { setSelectedColor(colors[0]?.value || ""); setSelectedSize(""); setAdded(false) }
  }, [isOpen, colors])

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = "" } }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[70vh] animate-fade-in">
        <div className="p-6">
          <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-border rounded-full" /></div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-medium">{product.title}</h3>
              {priceData && <p className="text-sm text-muted-foreground mt-1">{formatPrice(priceData.amount, priceData.currencyCode)}</p>}
            </div>
            <button onClick={onClose} className="p-2 -mr-2 -mt-1" aria-label="Fermer">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>

          {colors.length > 1 && (
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Couleur — {selectedColor}</p>
              <div className="flex gap-3">
                {colors.map((c) => (
                  <button key={c.value} onClick={() => { setSelectedColor(c.value); setSelectedSize("") }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.value ? "border-foreground scale-110" : "border-border"}`}
                    style={{ backgroundColor: colorToCSS(c.value) }} aria-label={c.label} />
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Taille</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const inStock = isSizeInStock(variants, selectedColor, s.value)
                  const selected = selectedSize === s.value
                  return (
                    <button key={s.value} onClick={() => inStock && setSelectedSize(s.value)} disabled={!inStock}
                      className={`h-11 min-w-[2.75rem] px-4 text-sm border transition-all ${
                        selected ? "bg-foreground text-background border-foreground"
                        : inStock ? "border-border hover:border-foreground"
                        : "border-border/50 text-muted-foreground/40 line-through cursor-not-allowed"
                      }`}>{s.label}</button>
                  )
                })}
              </div>
            </div>
          )}

          <button onClick={handleAdd} disabled={!selectedSize || adding || added}
            className={`w-full h-[52px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all ${
              added ? "bg-foreground text-background"
              : selectedSize ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}>
            {adding ? "Ajout..." : added ? "✓ Ajouté" : !selectedSize && sizes.length > 0 ? "Sélectionnez une taille" : "Ajouter au panier"}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Product Card ──

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const hasHover = useHasHover()

  const colors = extractColors(product)
  const sizes = extractSizes(product)
  const variants = buildVariantMap(product)
  const colorImages = getColorImages(product)
  const hasVariants = sizes.length > 0
  const hasColors = colors.length > 1

  const [hovered, setHovered] = useState(false)
  const [sizesVisible, setSizesVisible] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeColor, setActiveColor] = useState(colors[0]?.value || "")
  const [addingSize, setAddingSize] = useState<string | null>(null)
  const [addedSize, setAddedSize] = useState<string | null>(null)

  // Image based on active color (from metadata.color_images)
  const activeImage = getImageForColor(product, colorImages, activeColor)
  const fallbackImage = product.thumbnail || product.images?.[0]?.url || ""
  // Second image for hover crossfade: use second image from color set, or product second image
  const activeImages = colorImages[activeColor]
  const hoverImage = activeImages?.[1]?.url || product.images?.[1]?.url || ""

  const priceData = getProductPrice(product)
  const priceLabel = priceData ? formatPrice(priceData.amount, priceData.currencyCode) : ""

  const productUrl = `/products/${product.handle}`

  // Desktop: quick-add size
  const handleDesktopAddSize = useCallback(async (size: string) => {
    const color = activeColor || colors[0]?.value || ""
    const variantId = findVariantId(variants, color, size)
    if (!variantId) return
    setAddingSize(size)
    try {
      await addItem(variantId, 1)
      setAddingSize(null)
      setAddedSize(size)
      setTimeout(() => { setAddedSize(null); setSizesVisible(false) }, 1200)
    } catch { setAddingSize(null) }
  }, [activeColor, colors, variants, addItem])

  // No-variant: direct add
  const handleDirectAdd = useCallback(async () => {
    const variantId = product.variants?.[0]?.id
    if (!variantId) return
    setAddingSize("direct")
    try {
      await addItem(variantId, 1)
      setAddingSize(null)
      setAddedSize("direct")
      setTimeout(() => setAddedSize(null), 1200)
    } catch { setAddingSize(null) }
  }, [product.variants, addItem])

  const handlePlusInteraction = () => {
    if (!hasVariants) { handleDirectAdd(); return }
    if (hasHover) { setSizesVisible((v) => !v) }
    else { setSheetOpen(true) }
  }

  return (
    <>
      <div
        className="flex-shrink-0 w-[calc(100%/2.09)] md:w-[calc(100%/3.33)] lg:w-[calc(100%/4.44)] xl:w-[calc(100%/5.33)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setSizesVisible(false) }}
      >
        {/* ── Image area ── */}
        <div className="relative overflow-hidden">
          <Link href={productUrl} className="block bg-[#f5f5f5] aspect-[3/4] relative overflow-hidden">
            {/* Primary image — active color */}
            <Image
              src={activeImage || fallbackImage}
              alt={product.title}
              fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              style={{ opacity: hovered && !sizesVisible && hoverImage ? 0 : 1 }}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              loading="lazy"
            />
            {/* Hover image — second shot of active color */}
            {hoverImage && hoverImage !== activeImage && (
              <Image
                src={hoverImage}
                alt={`${product.title} - vue 2`}
                fill
                className="object-cover transition-opacity duration-500 ease-in-out"
                style={{ opacity: hovered && !sizesVisible ? 1 : 0 }}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                loading="lazy"
              />
            )}
          </Link>

          {/* ── "+" button — Represent style: no background, always visible ── */}
          <div
            className="absolute bottom-0 right-0 z-30"
            onMouseEnter={() => { if (hasHover && hasVariants) setSizesVisible(true) }}
          >
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handlePlusInteraction() }}
              className="p-[10px] lg:p-[13px] transition-opacity duration-200"
              aria-label={sizesVisible ? "Masquer les tailles" : "Ajouter rapidement"}
              aria-expanded={sizesVisible}
            >
              {addedSize === "direct" ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.5 6l3 3L10.5 3" stroke="black" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className="transition-transform duration-300 ease-out"
                  style={{ transform: sizesVisible ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  <line x1="6" y1="0.5" x2="6" y2="11.5" stroke="black" strokeWidth="0.75" />
                  <line x1="0.5" y1="6" x2="11.5" y2="6" stroke="black" strokeWidth="0.75" />
                </svg>
              )}
            </button>
          </div>

          {/* ── Desktop: size chips — Represent style ── */}
          {hasHover && hasVariants && (
            <div
              className={`absolute inset-x-0 bottom-0 z-20 transition-all duration-200 ease-out ${
                sizesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-center px-2 pb-[10px]">
                <div
                  className="flex gap-[2px] overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none" }}
                >
                  {sizes.map((s) => {
                    const inStock = isSizeInStock(variants, activeColor, s.value)
                    const isAdding = addingSize === s.value
                    const isAdded = addedSize === s.value
                    return (
                      <button
                        key={s.value}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (inStock && !isAdding) handleDesktopAddSize(s.value) }}
                        disabled={!inStock || isAdding}
                        className={`shrink-0 h-8 min-w-[2rem] px-2 text-[10px] tracking-wide border transition-all duration-150 ${
                          isAdded
                            ? "bg-black text-white border-black"
                            : isAdding
                              ? "border-black/30 text-black/30"
                              : inStock
                                ? "border-black/20 text-black/70 hover:border-black hover:text-black bg-white/80"
                                : "border-black/10 text-black/25 line-through cursor-not-allowed bg-white/50"
                        }`}
                        aria-label={inStock ? `Ajouter taille ${s.label}` : `Taille ${s.label} épuisée`}
                      >
                        {isAdded ? "✓" : s.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Product info ── */}
        <div className="flex flex-col gap-1 pt-4 text-xs px-[10px] lg:px-[14px] lg:flex-row lg:justify-between lg:gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <Link href={productUrl}>
              <h3 className="font-medium text-xs leading-tight">{product.title}</h3>
            </Link>

            {/* Color dots — interactive on desktop (change image) */}
            {hasColors && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onMouseEnter={() => { if (hasHover) setActiveColor(c.value) }}
                    onClick={() => setActiveColor(c.value)}
                    className={`w-2.5 h-2.5 rounded-full border transition-all ${
                      activeColor === c.value
                        ? "ring-1 ring-black ring-offset-1 scale-110"
                        : colorToCSS(c.value) === "#fff"
                          ? "border-black/20"
                          : "border-transparent"
                    }`}
                    style={{ backgroundColor: colorToCSS(c.value) }}
                    aria-label={c.label}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground ml-0.5">
                  {colors.length} couleurs
                </span>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {priceLabel && <span className="text-xs font-normal">{priceLabel}</span>}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {!hasHover && (
        <QuickAddBottomSheet
          product={product}
          colors={colors}
          sizes={sizes}
          variants={variants}
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
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
