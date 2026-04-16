"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import ProductImages from "@/components/product/ProductImages"
import type { ProductImagesHandle } from "@/components/product/ProductImages"
import ProductOptions from "@/components/product/ProductOptions"
import { formatPrice, getProductPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import { useRegion } from "@/providers/RegionProvider"
import { DEFAULT_REGION } from "@/lib/constants"
import { sdk } from "@/lib/sdk"
import type { Product } from "@/types"

// ── Product card for cross-sell / you may also like ──

function ProductCard({ product }: { product: Product }) {
  const priceData = getProductPrice(product)
  const thumbnail = product.thumbnail || product.images?.[0]?.url
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden">
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 45vw, 25vw"
            loading="lazy"
          />
        )}
      </div>
      <div className="mt-2.5">
        <p className="text-[12px] leading-tight line-clamp-1 group-hover:text-black/60 transition-colors">
          {product.title}
        </p>
        {priceData && (
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {formatPrice(priceData.amount, priceData.currencyCode)}
          </p>
        )}
      </div>
    </Link>
  )
}

// ── Main PDP ──

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { regionId } = useRegion()
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  // ── Option selection ──
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (product.variants?.length === 1 && product.options) {
      const defaults: Record<string, string> = {}
      product.options.forEach((opt) => {
        if (opt.values?.[0]) defaults[opt.id] = opt.values[0].value
      })
      return defaults
    }
    // Auto-select first color
    const colorOpt = product.options?.find((o) =>
      ["color", "couleur"].includes(o.title?.toLowerCase() || "")
    )
    if (colorOpt?.values?.[0]) {
      return { [colorOpt.id]: colorOpt.values[0].value }
    }
    return {}
  })

  const selectedVariant = useMemo(() => {
    if (!product.variants || !product.options) return null
    return (
      product.variants.find((variant) =>
        product.options!.every((option) => {
          const sel = selectedOptions[option.id]
          if (!sel) return false
          return variant.options?.find((vo) => vo.option_id === option.id)?.value === sel
        })
      ) ?? null
    )
  }, [product, selectedOptions])

  const price = selectedVariant?.calculated_price ?? product.variants?.[0]?.calculated_price
  const comparePrice = price?.original_amount && price.original_amount > (price.calculated_amount ?? 0)
    ? price.original_amount
    : null

  const imagesRef = useRef<ProductImagesHandle>(null)

  // Build a map: color value → index of first image for that color
  const colorImageIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    const colorImages = ((product.metadata as Record<string, unknown> | null)?.color_images as Record<string, { url: string }[]>) || {}
    const imageUrls = (product.images || []).map((img) => img.url)
    for (const [color, imgs] of Object.entries(colorImages)) {
      if (imgs?.[0]?.url) {
        const idx = imageUrls.indexOf(imgs[0].url)
        if (idx >= 0) map[color] = idx
      }
    }
    return map
  }, [product])

  const onOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
    // If color changed, scroll carousel to that color's image
    const colorOpt = product.options?.find((o) =>
      ["color", "couleur"].includes(o.title?.toLowerCase() || "")
    )
    if (colorOpt && optionId === colorOpt.id) {
      const targetIndex = colorImageIndexMap[value]
      if (targetIndex !== undefined) {
        imagesRef.current?.scrollTo(targetIndex)
      }
    }
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setAddingToCart(true)
    try {
      await addItem(selectedVariant.id, 1)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch { /* handled by provider */ }
    finally { setAddingToCart(false) }
  }

  // ── Cross-sell: related products ("Complétez le look") ──
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await sdk.client.fetch<{ related_product_ids: string[] }>(
          `/store/products/${product.id}/related`,
          { method: "GET" }
        )
        const ids = res.related_product_ids || []
        if (ids.length > 0 && !cancelled) {
          const { products } = await sdk.store.product.list({
            id: ids,
            region_id: regionId || DEFAULT_REGION,
            fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata",
            limit: 4,
          })
          if (!cancelled) setRelatedProducts((products as Product[]) || [])
        }
      } catch { /* no module or no associations */ }
    }
    run()
    return () => { cancelled = true }
  }, [product.id, regionId])

  // ── "You May Also Like" — products from same collection or category ──
  const [alsoLikeProducts, setAlsoLikeProducts] = useState<Product[]>([])
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { products } = await sdk.store.product.list({
          region_id: regionId || DEFAULT_REGION,
          fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata",
          limit: 8,
          order: "-created_at",
        })
        if (!cancelled) {
          // Exclude current product
          setAlsoLikeProducts(
            ((products as Product[]) || []).filter((p) => p.id !== product.id).slice(0, 6)
          )
        }
      } catch { /* */ }
    }
    run()
    return () => { cancelled = true }
  }, [product.id, regionId])

  // ── Category label ──
  const categories = (product as unknown as Record<string, unknown>).categories as { name: string }[] | undefined
  const categoryLabel = categories?.[0]?.name

  // ── Model info from metadata ──
  const modelInfo = (product.metadata as Record<string, string> | null)?.model_info

  const canAddToCart = !!selectedVariant?.id
  const inStock = selectedVariant ? (selectedVariant.inventory_quantity ?? 1) > 0 : true
  const lowStock = selectedVariant && (selectedVariant.inventory_quantity ?? 0) > 0 && (selectedVariant.inventory_quantity ?? 0) <= 3

  return (
    <div className="animate-fade-in">
      {/* ── Layout ── */}
      <div className="lg:grid lg:grid-cols-2">
        {/* Images */}
        <ProductImages ref={imagesRef} images={product.images || []} />

        {/* Product info — sticky on desktop */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="px-6 lg:px-12 pt-5 lg:pt-10 pb-32 lg:pb-16">
            {/* Category */}
            {categoryLabel && (
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                {categoryLabel}
              </p>
            )}

            {/* Title */}
            <h1 className="text-[15px] lg:text-[17px] font-medium uppercase tracking-[0.08em]">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-1.5 mb-6">
              {price && (
                <span className="text-[14px] tracking-[0.03em]">
                  {formatPrice(price.calculated_amount!, price.currency_code!)}
                </span>
              )}
              {comparePrice && price && (
                <span className="text-[13px] text-muted-foreground line-through">
                  {formatPrice(comparePrice, price.currency_code!)}
                </span>
              )}
            </div>

            {/* Options: colors + sizes */}
            <ProductOptions
              product={product}
              selectedOptions={selectedOptions}
              onOptionChange={onOptionChange}
              selectedVariant={selectedVariant}
            />

            {/* Model info */}
            {modelInfo && (
              <p className="text-[11px] text-muted-foreground mt-4">
                {modelInfo}
              </p>
            )}

            {/* Stock indicator */}
            {lowStock && (
              <p className="text-[11px] text-red-600 mt-3">
                Plus que {selectedVariant!.inventory_quantity} en stock
              </p>
            )}

            {/* Add to cart — desktop only (mobile has sticky) */}
            <div className="mt-6 hidden lg:block">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart || addingToCart || !inStock}
                className={`w-full h-[52px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer ${
                  !canAddToCart || !inStock
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : addedToCart
                      ? "bg-foreground text-background"
                      : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {addingToCart
                  ? "Ajout..."
                  : addedToCart
                    ? "Ajouté au panier"
                    : !inStock
                      ? "Épuisé"
                      : !canAddToCart
                        ? "Sélectionnez vos options"
                        : "Ajouter au panier"}
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 mt-5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 010 8h-1" />
                </svg>
                Retours sous 14 jours
              </span>
            </div>

            {/* In stock indicator */}
            {canAddToCart && inStock && !lowStock && (
              <p className="text-[11px] text-green-700 mt-3 uppercase tracking-[0.1em]">En stock</p>
            )}

            {/* Click & Collect */}
            <div className="flex items-start gap-3 mt-5 pt-5 border-t border-border">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground mt-0.5 shrink-0">
                <path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
              </svg>
              <div>
                <p className="text-[12px] font-medium">Retrait en boutique disponible</p>
                <p className="text-[11px] text-muted-foreground">Boutique Ice Industry Marseille — Prêt sous 24h</p>
              </div>
            </div>

            {/* ── Product Details — open, no accordion ── */}
            {product.description && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-3">
                  Détails du produit
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                {product.material && (
                  <p className="text-[13px] text-muted-foreground mt-2">
                    Composition : {product.material}
                  </p>
                )}
              </div>
            )}

            {/* ── Livraison & Retours — open ── */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-3">
                Livraison & Retours
              </h3>
              <div className="text-[13px] text-muted-foreground leading-relaxed space-y-1.5">
                <p>Livraison standard : 3-5 jours ouvrés</p>
                <p>Livraison express : 1-2 jours ouvrés</p>
                <p className="mt-3">Retours gratuits sous 14 jours en France métropolitaine.</p>
                <p>Les articles doivent être retournés dans leur état d&apos;origine, non portés, avec les étiquettes.</p>
              </div>
            </div>

            {/* ── Cross-sell: "Complétez le look" ── */}
            {relatedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] mb-4">
                  Complétez le look
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── "Vous aimerez aussi" — full width section below ── */}
      {alsoLikeProducts.length > 0 && (
        <div className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">
            Vous aimerez aussi
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {alsoLikeProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile CTA — portal to escape transform containing block */}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-6 py-4">
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart || addingToCart || !inStock}
              className={`w-full h-[48px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all ${
                !canAddToCart || !inStock
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : addedToCart
                    ? "bg-foreground text-background"
                    : "bg-foreground text-background cursor-pointer"
              }`}
            >
              {addingToCart
                ? "Ajout..."
                : addedToCart
                  ? "Ajouté au panier"
                  : !inStock
                    ? "Épuisé"
                    : !canAddToCart
                      ? "Sélectionnez vos options"
                      : price
                        ? `Ajouter au panier — ${formatPrice(price.calculated_amount!, price.currency_code!)}`
                        : "Ajouter au panier"}
            </button>
          </div>,
          document.body
        )}
    </div>
  )
}
