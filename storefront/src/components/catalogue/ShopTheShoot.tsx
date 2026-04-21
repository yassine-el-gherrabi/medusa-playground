"use client"

import { useState, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/providers/CartProvider"
import { useScrollLock } from "@/hooks/useScrollLock"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import {
  extractSizes,
  buildVariantMap,
  findVariantId,
  isSizeInStock,
} from "@/lib/product-helpers"
import { getProductPrice, formatPrice } from "@/lib/utils"
import type { Product } from "@/types"
import type { ShootData } from "@/types/catalogue"

type ShopTheShootProps = {
  shootData: ShootData
  products: Product[]
}

// ── Helpers ──

function productCategory(product: Product): string {
  return product.categories?.[0]?.name ?? ""
}

function productPriceStr(product: Product): string {
  const p = getProductPrice(product)
  return p ? formatPrice(p.amount, p.currencyCode) : ""
}

function padIdx(i: number): string {
  return String(i + 1).padStart(2, "0")
}

// ── Main Component ──

export default function ShopTheShoot({ shootData, products }: ShopTheShootProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (products.length === 0) return null

  return (
    <section className="bg-[var(--color-ink)] text-[var(--color-surface)] overflow-hidden">
      {/* ── Header ── */}
      <ShootHeader shootData={shootData} />

      {/* ── Image ── */}
      <ShootImage shootData={shootData} />

      {/* ── Desktop Rail ── */}
      <DesktopRail
        products={products}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
      />

      {/* ── Mobile Strip + Sheet ── */}
      <MobileStrip products={products} />
    </section>
  )
}

// ── Header ──

function ShootHeader({ shootData }: { shootData: ShootData }) {
  return (
    <div className="flex items-start justify-between px-5 lg:px-16 py-6 lg:py-10 border-b border-white/10">
      <div>
        {shootData.edition && (
          <p className="font-mono text-[10px] lg:text-[11px] tracking-[0.22em] uppercase text-white/55">
            {shootData.edition}
          </p>
        )}
        <h2 className="text-[26px] lg:text-[clamp(34px,3.4vw,52px)] font-medium tracking-[-0.025em] leading-tight mt-2.5">
          {shootData.title}
        </h2>
      </div>

      {shootData.credits && (
        <div className="hidden lg:block font-mono text-[10px] tracking-[0.18em] uppercase text-white/55 leading-[1.8] text-right shrink-0">
          {shootData.credits.photographer && (
            <span>Lensed · {shootData.credits.photographer}<br /></span>
          )}
          {shootData.credits.stylist && (
            <span>Styling · {shootData.credits.stylist}<br /></span>
          )}
          {shootData.credits.location && (
            <span>Location · {shootData.credits.location}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Image ──

function ShootImage({ shootData }: { shootData: ShootData }) {
  return (
    <div className="relative w-full aspect-[4/5] lg:aspect-[21/9] lg:max-h-[500px]">
      <div className="lg:hidden absolute inset-0">
        {shootData.image_url ? (
          <Image
            src={shootData.image_url}
            alt={shootData.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" />
        )}
      </div>
      <div className="hidden lg:block absolute inset-0">
        {shootData.image_url ? (
          <Image
            src={shootData.image_url}
            alt={shootData.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" />
        )}
      </div>
    </div>
  )
}

// ── Desktop Rail ──

function DesktopRail({
  products,
  activeIdx,
  setActiveIdx,
}: {
  products: Product[]
  activeIdx: number
  setActiveIdx: (i: number) => void
}) {
  const activeProduct = products[activeIdx]

  return (
    <div className="hidden lg:block">
      {/* Numbered tabs — max 6 visible, scroll if more */}
      <div
        className={`border-t border-white/10 ${products.length <= 6 ? "grid" : "flex overflow-x-auto"}`}
        style={products.length <= 6 ? { gridTemplateColumns: `repeat(${products.length}, 1fr)` } : { scrollbarWidth: "none" }}
      >
        {products.map((product, i) => {
          const isActive = i === activeIdx
          return (
            <button
              key={product.id}
              onClick={() => setActiveIdx(i)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`relative py-5 px-5 text-left transition-colors cursor-pointer border-none shrink-0 ${
                isActive ? "bg-white/[0.06]" : ""
              } ${i < products.length - 1 ? "border-r border-r-white/10" : ""}`}
              style={products.length > 6 ? { minWidth: 200 } : undefined}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white" />
              )}
              <p className="font-mono text-[10px] tracking-[0.2em] text-white/55">
                {padIdx(i)}
              </p>
              <p className="text-[16px] font-medium mt-3 truncate">
                {product.title}
              </p>
              <p className="text-[14px] font-medium mt-1.5 text-white/70">
                {productPriceStr(product)}
              </p>
            </button>
          )
        })}
      </div>

      {/* Detail strip for active product */}
      {activeProduct && (
        <DesktopDetailStrip product={activeProduct} />
      )}
    </div>
  )
}

// ── Desktop Detail Strip ──

function DesktopDetailStrip({ product }: { product: Product }) {
  const { addItem } = useCart()
  const sizes = useMemo(() => extractSizes(product), [product])
  const variants = useMemo(() => buildVariantMap(product), [product])
  const colors = useMemo(() => {
    const opt = product.options?.find((o) => ["couleur", "color"].includes(o.title?.toLowerCase() || ""))
    return opt?.values?.map((v) => v.value) || []
  }, [product])

  const [selectedColor, setSelectedColor] = useState(colors[0] || "")
  const [selectedSize, setSelectedSize] = useState("")
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const priceStr = productPriceStr(product)
  const category = productCategory(product)

  const canAdd = selectedSize && selectedColor && isSizeInStock(variants, selectedColor, selectedSize)
  const variantId = selectedSize && selectedColor ? findVariantId(variants, selectedColor, selectedSize) : null

  const handleAdd = useCallback(async () => {
    if (!variantId || adding) return
    setAdding(true)
    try {
      await addItem(variantId, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      /* silent */
    } finally {
      setAdding(false)
    }
  }, [variantId, adding, addItem])

  return (
    <div className="flex items-center py-5 px-8 gap-8 border-t border-white/10">
      {/* Thumbnail */}
      <div className="w-[60px] h-[60px] shrink-0 bg-[#1a1a1a] relative overflow-hidden">
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={product.title ?? ""}
            fill
            className="object-cover"
            sizes="120px"
          />
        )}
      </div>

      {/* Info */}
      <div className="shrink-0 min-w-[120px]">
        {category && (
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/55">
            {category}
          </p>
        )}
        <p className="text-[14px] font-medium mt-1">{product.title}</p>
      </div>

      {/* Colors (if multiple) */}
      {colors.length > 1 && (
        <div className="flex flex-row gap-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => { setSelectedColor(c); setSelectedSize("") }}
              className={`px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.1em] transition-colors cursor-pointer border ${
                selectedColor === c
                  ? "bg-white/20 text-white border-white/40"
                  : "text-white/50 border-white/15 hover:border-white/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="flex flex-row gap-1.5">
          {sizes.map((s) => {
            const inStock = isSizeInStock(variants, selectedColor, s.value)
            const isSelected = selectedSize === s.value
            return (
              <button
                key={s.value}
                onClick={() => inStock && setSelectedSize(s.value)}
                disabled={!inStock}
                className={`relative w-[40px] h-[36px] text-[12px] font-medium tracking-[0.02em] transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-surface)] text-[var(--color-ink)] border-[var(--color-surface)]"
                    : !inStock
                      ? "text-white/30 border-white/15 cursor-not-allowed"
                      : "text-[var(--color-surface)] border-white/25 hover:border-white/50"
                }`}
              >
                {s.value}
                {!inStock && (
                  <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(250,250,248,0.3)" strokeWidth="1" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={!canAdd && !added}
        className={`min-w-[240px] h-[52px] px-6 flex items-center justify-between text-[14px] font-medium transition-all cursor-pointer ${
          added
            ? "bg-[#2a5d3a] text-white"
            : canAdd
              ? "bg-[var(--color-surface)] text-[var(--color-ink)] hover:opacity-90"
              : "bg-white/[0.08] text-white/50 cursor-not-allowed"
        }`}
      >
        <span>
          {added
            ? "\u2713 Ajout\u00e9"
            : selectedSize
              ? `Ajouter \u00b7 ${selectedSize}`
              : "S\u00e9lectionner une taille"}
        </span>
        <span>{priceStr}</span>
      </button>
    </div>
  )
}

// ── Mobile Strip ──

function MobileStrip({ products }: { products: Product[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const isOpen = activeIdx !== null
  const activeProduct = activeIdx !== null ? products[activeIdx] : null

  const close = useCallback(() => setActiveIdx(null), [])

  useScrollLock(isOpen)
  useEscapeKey(isOpen, close)

  const handleThumbClick = (i: number) => {
    setActiveIdx((prev) => (prev === i ? null : i))
  }

  return (
    <div className="lg:hidden">
      {/* Thumb strip */}
      <div className="flex overflow-x-auto scrollbar-hide px-5 py-4 gap-2.5 border-t border-white/10">
        {products.map((product, i) => {
          const isActive = activeIdx === i
          return (
            <button
              key={product.id}
              onClick={() => handleThumbClick(i)}
              className={`min-w-[180px] flex gap-2.5 items-center p-2.5 border transition-colors cursor-pointer ${
                isActive
                  ? "border-[var(--color-surface)]"
                  : "border-white/20"
              }`}
            >
              <div className="w-[44px] h-[44px] shrink-0 bg-[#1a1a1a] relative overflow-hidden">
                {product.thumbnail && (
                  <Image
                    src={product.thumbnail}
                    alt={product.title ?? ""}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="text-left min-w-0">
                <p className="font-mono text-[10px] tracking-[0.18em] text-white/55">
                  {padIdx(i)}
                </p>
                <p className="text-[13px] font-medium truncate">
                  {product.title}
                </p>
                <p className="text-[12px] text-white/70">
                  {productPriceStr(product)}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom sheet */}
      {isOpen && activeProduct && (
        <MobileSheet product={activeProduct} onClose={close} />
      )}
    </div>
  )
}

// ── Mobile Sheet ──

function MobileSheet({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const { addItem } = useCart()
  const sizes = useMemo(() => extractSizes(product), [product])
  const variants = useMemo(() => buildVariantMap(product), [product])
  const [selectedSize, setSelectedSize] = useState("")
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const priceStr = productPriceStr(product)
  const category = productCategory(product)

  const defaultColor = product.options?.find((o) => ["couleur", "color"].includes(o.title?.toLowerCase() || ""))?.values?.[0]?.value || "Noir"
  const canAdd = selectedSize && isSizeInStock(variants, defaultColor, selectedSize)
  const variantId = selectedSize ? findVariantId(variants, defaultColor, selectedSize) : null

  const handleAdd = useCallback(async () => {
    if (!variantId || adding) return
    setAdding(true)
    try {
      await addItem(variantId, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      /* silent */
    } finally {
      setAdding(false)
    }
  }, [variantId, adding, addItem])

  const colCount = Math.min(sizes.length, 6)

  return (
    <div className="fixed inset-0 z-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 w-full max-h-[85%] overflow-y-auto bg-[var(--color-surface)] text-[var(--color-ink)]"
        style={{ animation: "sheetUp 360ms ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)]">
            Pièce identifiée
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[var(--color-ink)] cursor-pointer"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        {/* Product image */}
        <div className="relative w-full" style={{ aspectRatio: "1/1" }}>
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title ?? ""}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[var(--color-surface-warm)]" />
          )}
        </div>

        {/* Details */}
        <div className="px-5 pt-5 pb-3">
          {category && (
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)]">
              {category}
            </p>
          )}
          <h3 className="text-[22px] font-medium tracking-[-0.01em] mt-1">
            {product.title}
          </h3>
          <p className="text-[17px] font-medium mt-1.5">{priceStr}</p>
          {product.description && (
            <p className="text-[13px] text-[var(--color-muted)] mt-3 leading-relaxed line-clamp-3">
              {product.description}
            </p>
          )}
        </div>

        {/* Size grid */}
        {sizes.length > 0 && (
          <div className="px-5 pb-4">
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
            >
              {sizes.map((s) => {
                const inStock = isSizeInStock(variants, "Noir", s.value)
                const isSelected = selectedSize === s.value
                return (
                  <button
                    key={s.value}
                    onClick={() => inStock && setSelectedSize(s.value)}
                    disabled={!inStock}
                    aria-label={`Taille ${s.value}`}
                    className={`relative h-[46px] text-[13px] font-medium tracking-[0.02em] transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-ink)] text-[var(--color-surface)] border-[var(--color-ink)]"
                        : !inStock
                          ? "bg-transparent text-[var(--color-disabled)] border-[var(--color-border)] cursor-not-allowed"
                          : "bg-transparent text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-ink)]"
                    }`}
                  >
                    {s.value}
                    {!inStock && (
                      <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="0" y1="100" x2="100" y2="0" stroke="var(--color-border)" strokeWidth="1" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="px-5 pb-4">
          <button
            onClick={handleAdd}
            disabled={!canAdd && !added}
            className={`w-full h-[52px] px-6 flex items-center justify-between text-[14px] font-medium transition-all cursor-pointer ${
              added
                ? "bg-[#2a5d3a] text-white"
                : canAdd
                  ? "bg-[var(--color-ink)] text-[var(--color-surface)] hover:opacity-90"
                  : "bg-[var(--color-border)] text-[var(--color-disabled)] cursor-not-allowed"
            }`}
          >
            <span>
              {added
                ? "\u2713 Ajout\u00e9"
                : selectedSize
                  ? `Ajouter \u00b7 ${selectedSize}`
                  : "S\u00e9lectionner une taille"}
            </span>
            <span>{priceStr}</span>
          </button>
        </div>

        {/* Link to product page */}
        <div className="px-5 pb-6">
          <Link
            href={`/products/${product.handle}`}
            className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            Voir la fiche produit complète ↗
          </Link>
        </div>
      </div>
    </div>
  )
}
