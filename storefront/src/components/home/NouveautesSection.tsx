"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/types"
import { getProductPrice, formatPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import AnimatedLink from "@/components/ui/AnimatedLink"

// ── Helpers ──

type ColorOption = { value: string; label: string }
type SizeOption = { value: string; label: string }
type VariantInfo = {
  id: string
  color: string
  size: string
  inStock: boolean
}

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
      const title =
        o.option?.title?.toLowerCase() || o.option_id || ""
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

function findVariantId(
  variants: VariantInfo[],
  color: string,
  size: string
): string | null {
  const match = variants.find(
    (v) =>
      v.color.toLowerCase() === color.toLowerCase() &&
      v.size.toLowerCase() === size.toLowerCase()
  )
  return match?.id ?? null
}

function isSizeInStock(
  variants: VariantInfo[],
  color: string,
  size: string
): boolean {
  const match = variants.find(
    (v) =>
      v.color.toLowerCase() === color.toLowerCase() &&
      v.size.toLowerCase() === size.toLowerCase()
  )
  return match?.inStock ?? false
}

// Detect hover capability
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
      setTimeout(() => {
        onClose()
        setAdded(false)
        setSelectedSize("")
      }, 600) // brief feedback before closing
    } catch {
      // Cart provider handles error state
    } finally {
      setAdding(false)
    }
  }

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedColor(colors[0]?.value || "")
      setSelectedSize("")
      setAdded(false)
    }
  }, [isOpen, colors])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[70vh] animate-fade-in">
        <div className="p-6">
          {/* Handle bar */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          {/* Product info */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-medium">{product.title}</h3>
              {priceData && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPrice(priceData.amount, priceData.currencyCode)}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 -mt-1"
              aria-label="Fermer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          {/* Color selection */}
          {colors.length > 1 && (
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                Couleur — {selectedColor}
              </p>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setSelectedColor(color.value)
                      setSelectedSize("") // reset size when color changes
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.value
                        ? "border-foreground scale-110"
                        : "border-border"
                    }`}
                    style={{
                      backgroundColor:
                        color.value.toLowerCase() === "black"
                          ? "#000"
                          : color.value.toLowerCase() === "white"
                            ? "#fff"
                            : color.value.toLowerCase(),
                    }}
                    aria-label={color.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size selection */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                Taille
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const inStock = isSizeInStock(variants, selectedColor, size.value)
                  const isSelected = selectedSize === size.value
                  return (
                    <button
                      key={size.value}
                      onClick={() => inStock && setSelectedSize(size.value)}
                      disabled={!inStock}
                      className={`h-11 min-w-[2.75rem] px-4 text-sm border transition-all ${
                        isSelected
                          ? "bg-foreground text-background border-foreground"
                          : inStock
                            ? "border-border hover:border-foreground"
                            : "border-border/50 text-muted-foreground/40 line-through cursor-not-allowed"
                      }`}
                    >
                      {size.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add to bag */}
          <button
            onClick={handleAdd}
            disabled={!selectedSize || adding || added}
            className={`w-full h-[52px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all ${
              added
                ? "bg-foreground text-background"
                : selectedSize
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {adding
              ? "Ajout..."
              : added
                ? "✓ Ajouté"
                : sizes.length === 0
                  ? "Ajouter au panier"
                  : !selectedSize
                    ? "Sélectionnez une taille"
                    : "Ajouter au panier"}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Desktop inline size chips ──

function DesktopSizeChips({
  sizes,
  variants,
  activeColor,
  visible,
  onSelectSize,
  addingSize,
  addedSize,
}: {
  sizes: SizeOption[]
  variants: VariantInfo[]
  activeColor: string
  visible: boolean
  onSelectSize: (size: string) => void
  addingSize: string | null
  addedSize: string | null
}) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 transition-all duration-200 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <div className="bg-gradient-to-t from-black/50 to-transparent pt-10 pb-3 px-3">
        <div className="flex justify-center gap-[3px]">
          {sizes.map((size) => {
            const inStock = isSizeInStock(variants, activeColor, size.value)
            const isAdding = addingSize === size.value
            const isAdded = addedSize === size.value
            return (
              <button
                key={size.value}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (inStock && !isAdding) onSelectSize(size.value)
                }}
                disabled={!inStock || isAdding}
                className={`h-8 min-w-[2rem] px-2 text-[11px] tracking-wide transition-all duration-150 ${
                  isAdded
                    ? "bg-white text-black"
                    : isAdding
                      ? "bg-white/30 text-white"
                      : inStock
                        ? "bg-black/40 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-black"
                        : "bg-black/20 text-white/30 line-through cursor-not-allowed border border-white/10"
                }`}
                aria-label={
                  inStock
                    ? `Ajouter taille ${size.label} au panier`
                    : `Taille ${size.label} épuisée`
                }
              >
                {isAdded ? "✓" : size.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Product Card ──

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const hasHover = useHasHover()

  const colors = extractColors(product)
  const sizes = extractSizes(product)
  const variants = buildVariantMap(product)

  const [hovered, setHovered] = useState(false)
  const [sizesVisible, setSizesVisible] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeColor] = useState(colors[0]?.value || "")
  const [addingSize, setAddingSize] = useState<string | null>(null)
  const [addedSize, setAddedSize] = useState<string | null>(null)

  const thumbnail = product.thumbnail || product.images?.[0]?.url
  const thumbnailAlt = product.images?.[1]?.url || thumbnail

  const priceData = getProductPrice(product)
  const priceLabel = priceData
    ? formatPrice(priceData.amount, priceData.currencyCode)
    : ""
  const hasVariants = sizes.length > 0

  const productUrl = `/products/${product.handle}`

  // Desktop: quick-add a size directly
  const handleDesktopAddSize = useCallback(
    async (size: string) => {
      const color = activeColor || colors[0]?.value || ""
      const variantId = findVariantId(variants, color, size)
      if (!variantId) return

      setAddingSize(size)
      try {
        await addItem(variantId, 1)
        setAddingSize(null)
        setAddedSize(size)
        setTimeout(() => {
          setAddedSize(null)
          setSizesVisible(false)
        }, 1200) // show feedback then close
      } catch {
        setAddingSize(null)
      }
    },
    [activeColor, colors, variants, addItem]
  )

  // Mobile: open bottom sheet
  const handlePlusClick = () => {
    if (hasHover) {
      // Desktop: toggle inline sizes
      setSizesVisible((v) => !v)
    } else {
      // Mobile: open bottom sheet
      setSheetOpen(true)
    }
  }

  // No-variant products: direct add
  const handleDirectAdd = useCallback(async () => {
    const variantId = product.variants?.[0]?.id
    if (!variantId) return
    setAddingSize("direct")
    try {
      await addItem(variantId, 1)
      setAddingSize(null)
      setAddedSize("direct")
      setTimeout(() => setAddedSize(null), 1200)
    } catch {
      setAddingSize(null)
    }
  }, [product.variants, addItem])

  return (
    <>
      <div
        className="flex-shrink-0 w-[calc(100%/2.09)] md:w-[calc(100%/3.33)] lg:w-[calc(100%/4.44)] xl:w-[calc(100%/5.33)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false)
          setSizesVisible(false)
        }}
      >
        {/* Image area */}
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

          {/* "+" button — desktop: visible on hover / mobile: always visible */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              if (!hasVariants) {
                handleDirectAdd()
              } else {
                handlePlusClick()
              }
            }}
            className={`absolute bottom-2 right-2 z-30 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-black/10 transition-all duration-200 ${
              hasHover
                ? hovered
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90"
                : "opacity-100" // always visible on mobile
            } ${addedSize === "direct" ? "bg-foreground" : ""}`}
            aria-label={
              sizesVisible ? "Masquer les tailles" : "Ajouter rapidement"
            }
            aria-expanded={sizesVisible}
          >
            {addedSize === "direct" ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="transition-transform duration-300"
                style={{
                  transform: sizesVisible ? "rotate(45deg)" : "rotate(0deg)",
                }}
              >
                <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="1" />
                <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1" />
              </svg>
            )}
          </button>

          {/* Desktop: inline size chips */}
          {hasHover && hasVariants && (
            <DesktopSizeChips
              sizes={sizes}
              variants={variants}
              activeColor={activeColor}
              visible={sizesVisible}
              onSelectSize={handleDesktopAddSize}
              addingSize={addingSize}
              addedSize={addedSize}
            />
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-1 pt-4 text-xs px-[10px] lg:px-[14px] lg:flex-row lg:justify-between lg:gap-4">
          <Link href={productUrl} className="flex flex-col gap-1 min-w-0">
            <h3 className="font-medium text-xs leading-tight">
              {product.title}
            </h3>

            {/* Color dots */}
            {colors.length > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {colors.slice(0, 5).map((color) => (
                  <span
                    key={color.value}
                    className={`w-2.5 h-2.5 rounded-full border ${
                      color.value.toLowerCase() === "white"
                        ? "border-border"
                        : "border-transparent"
                    }`}
                    style={{
                      backgroundColor:
                        color.value.toLowerCase() === "black"
                          ? "#000"
                          : color.value.toLowerCase() === "white"
                            ? "#fff"
                            : color.value.toLowerCase(),
                    }}
                  />
                ))}
                {colors.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{colors.length - 5}
                  </span>
                )}
                {colors.length > 1 && (
                  <span className="text-[10px] text-muted-foreground ml-0.5">
                    {colors.length} couleurs
                  </span>
                )}
              </div>
            )}
          </Link>

          <div className="flex-shrink-0">
            {priceLabel && (
              <span className="text-xs font-normal">{priceLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
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
        {/* Header */}
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

        {/* Horizontal scroll */}
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

        <div className="pb-6 md:pb-10 hidden md:block" />
      </div>
    </section>
  )
}