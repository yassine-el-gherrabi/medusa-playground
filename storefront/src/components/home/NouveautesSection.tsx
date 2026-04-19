"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/types"
import { getProductPrice, formatPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import {
  extractColors,
  extractSizes,
  buildVariantMap,
  findVariantId,
  isSizeInStock,
  getColorImages,
  getImageForColor,
  getSecondImage,
  getColorThumbnail,
  getCompareAtPrice,
} from "@/lib/product-helpers"

// ── Product Card ──

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  const colors = extractColors(product)
  const sizes = extractSizes(product)
  const variants = buildVariantMap(product)
  const colorImages = getColorImages(product)
  const hasVariants = sizes.length > 0
  const compareAtPrice = getCompareAtPrice(product)

  const [activeColor, setActiveColor] = useState(colors[0]?.value || "Noir")
  const [hovered, setHovered] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  // Mobile bottom sheet
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetColor, setSheetColor] = useState(colors[0]?.value || "")
  const [sheetSize, setSheetSize] = useState("")

  const activeImage = getImageForColor(product, colorImages, activeColor)
  const hoverImage = getSecondImage(product, colorImages, activeColor)
  const fallbackImage = product.thumbnail || product.images?.[0]?.url || ""
  const displayImage = activeImage || fallbackImage

  const priceData = getProductPrice(product)
  const priceLabel = priceData ? formatPrice(priceData.amount, priceData.currencyCode) : ""
  const compareLabel = compareAtPrice && priceData ? formatPrice(compareAtPrice, priceData.currencyCode) : null
  const productUrl = `/products/${product.handle}`

  // Desktop quick-add
  const handleQuickAdd = useCallback(async () => {
    if (!hasVariants) {
      const variantId = product.variants?.[0]?.id
      if (!variantId) return
      setAdding(true)
      try { await addItem(variantId, 1) } catch { /* */ } finally { setAdding(false) }
      return
    }
    if (!quickAddOpen) { setQuickAddOpen(true); setSelectedSize(null); return }
    if (!selectedSize) return
    const variantId = findVariantId(variants, activeColor, selectedSize)
    if (!variantId) return
    setAdding(true)
    try { await addItem(variantId, 1); setQuickAddOpen(false); setSelectedSize(null) }
    catch { /* */ } finally { setAdding(false) }
  }, [hasVariants, quickAddOpen, selectedSize, activeColor, variants, product.variants, addItem])

  // Mobile add
  const handleSheetAdd = useCallback(async () => {
    const color = sheetColor || colors[0]?.value || ""
    const variantId = sizes.length > 0
      ? findVariantId(variants, color, sheetSize)
      : product.variants?.[0]?.id || null
    if (!variantId) return
    setAdding(true)
    try { await addItem(variantId, 1); setSheetOpen(false) }
    catch { /* */ } finally { setAdding(false) }
  }, [sheetColor, sheetSize, colors, sizes, variants, product.variants, addItem])

  return (
    <div
      className="flex-shrink-0 w-[calc(100%/2.15)] md:w-[calc(100%/3.2)] lg:w-[calc(100%/4.3)]"
    >
      {/* ── Image ── */}
      <div
        className="relative"
        onMouseLeave={() => { setHovered(false); setQuickAddOpen(false); setSelectedSize(null) }}
      >
        <Link
          href={productUrl}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="block bg-[#f5f5f5] aspect-[3/4] relative overflow-hidden"
        >
          <Image
            src={displayImage} alt={product.title} fill
            className="object-cover transition-opacity duration-500"
            style={{ opacity: hovered && hoverImage ? 0 : 1 }}
            sizes="(max-width: 640px) 47vw, (max-width: 1024px) 31vw, 23vw"
            loading="lazy"
          />
          {hoverImage && hoverImage !== displayImage && (
            <Image
              src={hoverImage} alt={`${product.title} - vue 2`} fill
              className="object-cover transition-opacity duration-500"
              style={{ opacity: hovered ? 1 : 0 }}
              sizes="(max-width: 640px) 47vw, (max-width: 1024px) 31vw, 23vw"
              loading="lazy"
            />
          )}
        </Link>

        {/* Desktop [+] — visible when sizes not open */}
        {!quickAddOpen && (
          <button
            type="button"
            onMouseEnter={() => { if (hasVariants) setQuickAddOpen(true) }}
            onClick={handleQuickAdd}
            className="hidden md:flex absolute bottom-3 right-3 z-10 w-8 h-8 items-center justify-center cursor-pointer"
            aria-label="Ajout rapide"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="0.5" x2="6" y2="11.5" stroke="black" strokeWidth="0.75" />
              <line x1="0.5" y1="6" x2="11.5" y2="6" stroke="black" strokeWidth="0.75" />
            </svg>
          </button>
        )}

        {/* Mobile [+] quick-add */}
        <button
          type="button"
          onClick={() => { setSheetOpen(true); setSheetColor(activeColor); setSheetSize("") }}
          className="md:hidden absolute bottom-2 right-2 z-10 p-2 cursor-pointer"
          aria-label="Ajout rapide"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <line x1="6" y1="0.5" x2="6" y2="11.5" stroke="black" strokeWidth="0.75" />
            <line x1="0.5" y1="6" x2="11.5" y2="6" stroke="black" strokeWidth="0.75" />
          </svg>
        </button>

        {/* Desktop: size selector — inside image, bottom-left, Represent-style */}
        {quickAddOpen && hasVariants && (
          <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-10 animate-fade-in bg-white/30 backdrop-blur-md rounded-[2px] overflow-hidden">
            {!selectedSize ? (
              sizes.map((s) => {
                const inStock = isSizeInStock(variants, activeColor, s.value)
                return (
                  <button
                    key={s.value}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (inStock) setSelectedSize(s.value) }}
                    disabled={!inStock}
                    className={`w-[36px] h-[36px] text-[12px] transition-colors border-r border-white/30 last:border-r-0 ${
                      inStock
                        ? "text-foreground hover:bg-white/50 cursor-pointer"
                        : "text-black/25 line-through cursor-not-allowed"
                    }`}
                  >
                    {s.label}
                  </button>
                )
              })
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleQuickAdd() }}
                disabled={adding}
                className="px-5 h-[36px] text-[11px] font-medium uppercase tracking-[0.12em] bg-black/80 backdrop-blur-md text-white hover:bg-black/90 transition-colors cursor-pointer"
              >
                {adding ? "Ajout..." : "Ajouter au panier"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Product info ── */}
      <div className="pt-3 md:pt-4 pr-2">
        {/* Title + Price — same line */}
        <div className="flex items-baseline justify-between gap-3">
          <Link href={productUrl} className="min-w-0 flex-1">
            <h3 className="text-[12px] md:text-[13px] font-medium leading-tight tracking-[0.02em] truncate">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-baseline gap-1.5 shrink-0">
            {compareLabel && (
              <span className="text-[11px] text-muted-foreground line-through">{compareLabel}</span>
            )}
            {priceLabel && (
              <span className="text-[12px] md:text-[13px] tracking-[0.03em]">{priceLabel}</span>
            )}
          </div>
        </div>

        {/* Active color name */}
        <p className="text-[11px] text-muted-foreground mt-1">{activeColor}</p>

        {/* Color swatches — image thumbnails */}
        {colors.length > 1 && (
          <div className="flex gap-3 mt-2 p-[3px] -ml-[3px] overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {colors.map((c) => {
              const thumb = getColorThumbnail(colorImages, c.value)
              const isActive = activeColor === c.value
              return (
                <button
                  key={c.value}
                  onClick={() => setActiveColor(c.value)}
                  className="relative shrink-0 cursor-pointer"
                  aria-label={c.label}
                >
                  <div className={`w-10 h-[52px] md:w-11 md:h-[56px] overflow-hidden bg-[#f5f5f5] transition-all ${
                    isActive ? "ring-1 ring-black ring-offset-1" : ""
                  }`}
                    onMouseEnter={() => setActiveColor(c.value)}
                  >
                    {thumb ? (
                      <Image src={thumb} alt={c.label} fill className="object-cover" sizes="44px" />
                    ) : (
                      <div className="w-full h-full bg-[#e0e0e0]" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

      </div>

      {/* ── Mobile bottom sheet ── */}
      {sheetOpen && typeof document !== "undefined" && createPortal(
        <>
          <div className="md:hidden fixed inset-0 z-[100] bg-black/50" onClick={() => setSheetOpen(false)} />
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[101] bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="px-6 pt-5 pb-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-sm font-medium">{product.title}</h3>
                  {priceLabel && <p className="text-sm text-muted-foreground mt-1">{priceLabel}</p>}
                </div>
                <button onClick={() => setSheetOpen(false)} className="p-2 -mr-2 -mt-1 cursor-pointer" aria-label="Fermer">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
              </div>

              {/* Product images gallery */}
              {(() => {
                const imgs = colorImages[sheetColor] || colorImages[colors[0]?.value || ""] || []
                const allImgs = imgs.length > 0 ? imgs : (product.images || []).map((img) => ({ url: img.url }))
                return allImgs.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 -mx-6 px-6" style={{ scrollbarWidth: "none" }}>
                    {allImgs.map((img, i) => (
                      <div key={i} className="shrink-0 w-[160px] aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden rounded">
                        <Image src={img.url} alt={`${product.title} ${i + 1}`} fill className="object-cover" sizes="160px" />
                      </div>
                    ))}
                  </div>
                ) : null
              })()}

              {/* Color swatches — image thumbnails */}
              {colors.length > 1 && (
                <div className="mb-5">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                    Couleur — {sheetColor}
                  </p>
                  <div className="flex gap-2">
                    {colors.map((c) => {
                      const thumb = getColorThumbnail(colorImages, c.value)
                      const isActive = sheetColor === c.value
                      return (
                        <button
                          key={c.value}
                          onClick={() => { setSheetColor(c.value); setSheetSize("") }}
                          className="relative shrink-0 cursor-pointer"
                          aria-label={c.label}
                        >
                          <div className={`w-12 h-16 overflow-hidden bg-[#f5f5f5] ${
                            isActive ? "ring-1 ring-black ring-offset-1" : ""
                          }`}>
                            {thumb ? (
                              <Image src={thumb} alt={c.label} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="w-full h-full bg-[#e0e0e0]" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size selector */}
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
                onClick={handleSheetAdd}
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
        {/* Header */}
        <div className="flex items-end justify-between px-6 md:px-10 pt-6 md:pt-10 pb-6 md:pb-8">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">Nouveautés</h2>
        </div>

        {/* Carousel — last card clipped to hint scrollability */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth scrollbar-hide px-6 md:px-10" style={{ scrollbarWidth: "none" }}>
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        {/* "Voir tout" centered below */}
        <div className="flex justify-center py-8 md:py-10">
          <Link
            href="/boutique"
            className="text-[11px] font-medium uppercase tracking-[0.15em] group relative"
          >
            <span className="relative">
              Voir tout
              <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current origin-right transition-transform duration-300 group-hover:scale-x-0" />
              <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current scale-x-0 origin-left transition-transform duration-300 delay-200 group-hover:scale-x-100" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
