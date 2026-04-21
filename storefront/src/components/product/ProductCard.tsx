"use client"

import { useState, useCallback } from "react"
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
  isColorInStock,
  getColorImages,
  getImageForColor,
  getSecondImage,
  getColorThumbnail,
  getCompareAtPrice,
  COLOR_MAP,
} from "@/lib/product-helpers"

/**
 * Shared ProductCard — used on homepage, PDP sections, and cart.
 * Parent controls sizing via grid/flex. Card fills its container.
 *
 * Features: hover image swap, [+] quick-add, glass bar sizes (desktop),
 * mobile bottom sheet with colors + sizes + images, color name text.
 */
export default function ProductCard({ product, showSwatches = false }: { product: Product; showSwatches?: boolean }) {
  const { addItem } = useCart()

  const colors = extractColors(product)
  const sizes = extractSizes(product)
  const variants = buildVariantMap(product)
  const colorImages = getColorImages(product)
  const hasVariants = sizes.length > 0
  const hasColorOption = product.options?.some((o) => ["color", "couleur"].includes(o.title?.toLowerCase() || "")) ?? false
  const compareAtPrice = getCompareAtPrice(product)

  const [activeColor, setActiveColor] = useState(colors[0]?.value || "Noir")
  const [hovered, setHovered] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetColor, setSheetColor] = useState(colors[0]?.value || "")
  const [sheetSize, setSheetSize] = useState("")

  const activeImage = getImageForColor(product, colorImages, activeColor)
  const hoverImage = getSecondImage(product, colorImages, activeColor)
  const displayImage = activeImage || product.thumbnail || product.images?.[0]?.url || ""

  const priceData = getProductPrice(product)
  const priceLabel = priceData ? formatPrice(priceData.amount, priceData.currencyCode) : ""
  const compareLabel = compareAtPrice && priceData ? formatPrice(compareAtPrice, priceData.currencyCode) : null
  const productUrl = `/products/${product.handle}`

  // Check if this product has any in-stock variants at all
  const hasAnyStock = product.variants?.some((v) => (v.inventory_quantity ?? 1) > 0) ?? false

  const handleQuickAdd = useCallback(async () => {
    if (hasVariants) return
    const variant = product.variants?.[0]
    if (!variant?.id) return
    // Block adding OOS items
    if ((variant.inventory_quantity ?? 1) <= 0) return
    setAdding(true)
    try { await addItem(variant.id, 1) } catch { /* */ } finally { setAdding(false) }
  }, [hasVariants, product.variants, addItem])

  const handleSheetAdd = useCallback(async () => {
    const color = sheetColor || colors[0]?.value || ""
    if (sizes.length > 0) {
      // Check stock before adding
      if (!isSizeInStock(variants, color, sheetSize)) return
      const variantId = findVariantId(variants, color, sheetSize)
      if (!variantId) return
      setAdding(true)
      try { await addItem(variantId, 1); setSheetOpen(false) } catch { /* */ } finally { setAdding(false) }
    } else {
      const variant = product.variants?.[0]
      if (!variant?.id || (variant.inventory_quantity ?? 1) <= 0) return
      setAdding(true)
      try { await addItem(variant.id, 1); setSheetOpen(false) } catch { /* */ } finally { setAdding(false) }
    }
  }, [sheetColor, sheetSize, colors, sizes, variants, product.variants, addItem])

  return (
    <div className="w-full">
      {/* Image */}
      <div className="relative" onMouseLeave={() => { setHovered(false); setQuickAddOpen(false) }}>
        <Link href={productUrl} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="block bg-[#f5f5f5] aspect-[3/4] relative overflow-hidden">
          <Image src={displayImage} alt={`${product.title} — Ice Industry`} fill className="object-cover transition-opacity duration-500" style={{ opacity: hovered && hoverImage ? 0 : 1 }} sizes="(max-width: 640px) 47vw, (max-width: 1024px) 31vw, 23vw" loading="lazy" />
          {hoverImage && hoverImage !== displayImage && (
            <Image src={hoverImage} alt={`${product.title} — vue 2`} fill className="object-cover transition-opacity duration-500" style={{ opacity: hovered ? 1 : 0 }} sizes="(max-width: 640px) 47vw, (max-width: 1024px) 31vw, 23vw" loading="lazy" />
          )}
        </Link>

        {/* Desktop [+] */}
        {!quickAddOpen && hasAnyStock && (
          <button type="button" onMouseEnter={() => { if (hasVariants) setQuickAddOpen(true) }} onClick={handleQuickAdd} className="hidden md:flex absolute bottom-3 right-3 z-10 w-8 h-8 items-center justify-center cursor-pointer group/plus" aria-label="Ajout rapide">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform duration-200 group-hover/plus:scale-125">
              <line x1="6" y1="0.5" x2="6" y2="11.5" stroke="black" strokeWidth="0.75" />
              <line x1="0.5" y1="6" x2="11.5" y2="6" stroke="black" strokeWidth="0.75" />
            </svg>
          </button>
        )}

        {/* Mobile [+] */}
        {hasAnyStock && (
          <button type="button" onClick={() => { setSheetOpen(true); setSheetColor(activeColor); setSheetSize("") }} className="md:hidden absolute bottom-2 right-2 z-10 p-2 cursor-pointer" aria-label="Ajout rapide">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="0.5" x2="6" y2="11.5" stroke="black" strokeWidth="0.75" />
              <line x1="0.5" y1="6" x2="11.5" y2="6" stroke="black" strokeWidth="0.75" />
            </svg>
          </button>
        )}

        {/* Desktop glass bar sizes */}
        {quickAddOpen && hasVariants && (
          <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-10 animate-fade-in bg-black/30 backdrop-blur-md rounded-[2px] border border-white/30 overflow-x-auto scrollbar-hide max-w-[85%]" style={{ scrollbarWidth: "none" }}>
            {sizes.map((s) => {
              const inStock = isSizeInStock(variants, activeColor, s.value)
              return (
                <button key={s.value} onClick={async (e) => { e.stopPropagation(); e.preventDefault(); if (!inStock) return; const vid = findVariantId(variants, activeColor, s.value); if (!vid) return; setAdding(true); try { await addItem(vid, 1) } catch {} finally { setAdding(false); setQuickAddOpen(false) } }} disabled={!inStock || adding}
                  className={`shrink-0 min-w-[36px] px-2 h-[36px] text-[12px] transition-colors border-r border-white/20 last:border-r-0 ${!inStock ? "text-white/25 line-through cursor-not-allowed" : adding ? "text-white/50 cursor-wait" : "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"}`}>
                  {s.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 px-1">
        <div className="flex items-baseline justify-between gap-3">
          <Link href={productUrl} className="min-w-0 flex-1">
            <h3 className="text-[12px] md:text-[13px] font-medium leading-tight tracking-[0.02em] truncate">{product.title}</h3>
          </Link>
          <div className="flex items-baseline gap-1.5 shrink-0">
            {compareLabel && <span className="text-[11px] text-muted-foreground line-through">{compareLabel}</span>}
            {priceLabel && <span className="text-[12px] md:text-[13px] tracking-[0.03em]">{priceLabel}</span>}
          </div>
        </div>
        {showSwatches && colors.length > 1 && (
          <div className="hidden md:flex gap-1.5 mt-2">
            {colors.map((c) => {
              const thumb = getColorThumbnail(colorImages, c.value)
              const isActive = activeColor === c.value
              return (
                <button
                  key={c.value}
                  onClick={() => setActiveColor(c.value)}
                  title={c.label}
                  aria-label={`Couleur ${c.label}`}
                  className={`relative cursor-pointer shrink-0 ${thumb ? "w-20 h-[104px]" : "w-9 h-9"} ${isActive ? "" : "opacity-50 hover:opacity-80"} transition-opacity`}
                >
                  {thumb ? (
                    <Image src={thumb} alt={c.label} fill className="object-cover" sizes="240px" />
                  ) : (
                    <span className="block w-full h-full" style={{ backgroundColor: COLOR_MAP[c.value] || "#ccc" }} />
                  )}
                  {isActive && <span className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--color-ink)]" />}
                </button>
              )
            })}
          </div>
        )}
        <p className={`text-[11px] text-muted-foreground mt-1 ${showSwatches && colors.length > 1 ? "md:hidden" : ""}`}>{activeColor}{colors.length > 1 && ` · ${colors.length} couleurs`}</p>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen && typeof document !== "undefined" && createPortal(
        <>
          <div className="md:hidden fixed inset-0 z-[100] bg-black/50" onClick={() => setSheetOpen(false)} />
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[101] bg-[var(--color-surface)] rounded-t-2xl max-h-[85vh] overflow-y-auto animate-fade-in">
            <div className="px-6 pt-5 pb-8">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-sm font-medium">{product.title}</h3>
                  {priceLabel && <p className="text-sm text-muted-foreground mt-1">{priceLabel}</p>}
                </div>
                <button onClick={() => setSheetOpen(false)} className="p-2 -mr-2 -mt-1 cursor-pointer" aria-label="Fermer">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
              </div>

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

              {colors.length > 1 && hasColorOption && (
                <div className="mb-5">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Couleur — {sheetColor}</p>
                  <div className="flex gap-2">
                    {colors.map((c) => {
                      const thumb = getColorThumbnail(colorImages, c.value)
                      const colorHasStock = isColorInStock(variants, c.value)
                      return (
                        <button key={c.value} onClick={() => { setSheetColor(c.value); setSheetSize("") }} className={`relative shrink-0 cursor-pointer ${!colorHasStock ? "opacity-30" : ""}`} aria-label={`${c.label}${!colorHasStock ? " (épuisé)" : ""}`}>
                          <div className={`w-12 h-16 overflow-hidden bg-[#f5f5f5] ${sheetColor === c.value ? "ring-1 ring-black ring-offset-1" : ""}`}>
                            {thumb ? <Image src={thumb} alt={c.label} fill className="object-cover" sizes="48px" /> : <div className="w-full h-full bg-[#e0e0e0]" />}
                          </div>
                          {!colorHasStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="block w-[140%] h-px bg-black/40 -rotate-45" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Taille</p>
                  <div className="flex flex-wrap gap-4">
                    {sizes.map((s) => {
                      const inStock = isSizeInStock(variants, sheetColor || colors[0]?.value || "", s.value)
                      return (
                        <button key={s.value} onClick={() => inStock && setSheetSize(s.value)} disabled={!inStock}
                          className={`relative text-sm pb-1 transition-colors cursor-pointer ${sheetSize === s.value ? "text-foreground font-medium" : inStock ? "text-muted-foreground" : "text-black/20 line-through cursor-not-allowed"}`}>
                          {s.label}
                          <span className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-200 ${sheetSize === s.value ? "bg-black" : "bg-transparent"}`} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {(() => {
                const sheetInStock = sheetSize ? isSizeInStock(variants, sheetColor || colors[0]?.value || "", sheetSize) : true
                const isDisabled = adding || (sizes.length > 0 && !sheetSize) || (sheetSize && !sheetInStock)
                const label = adding ? "Ajout..." : sizes.length > 0 && !sheetSize ? "Sélectionnez une taille" : sheetSize && !sheetInStock ? "Épuisé" : "Ajouter au panier"
                return (
                  <button onClick={handleSheetAdd} disabled={!!isDisabled}
                    className={`w-full h-[52px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer ${isDisabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-foreground text-background"}`}
                    style={sheetSize && !sheetInStock ? { opacity: 0.5 } : undefined}>
                    {label}
                  </button>
                )
              })()}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
