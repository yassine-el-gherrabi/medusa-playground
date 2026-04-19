"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import ProductImages from "@/components/product/ProductImages"
import ProductOptions from "@/components/product/ProductOptions"
import type { ProductImagesHandle } from "@/components/product/ProductImages"
import { formatPrice, getProductPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import { useRegion } from "@/providers/RegionProvider"
import { DEFAULT_REGION } from "@/lib/constants"
import { sdk } from "@/lib/sdk"
import { getColorImages, getCompareAtPrice } from "@/lib/product-helpers"
import type { Product } from "@/types"

// ── Types ──

type RecentItem = { id: string; handle: string; title: string; thumbnail: string }

// ── Recently Viewed (localStorage with error handling) ──

function addToRecentlyViewed(productId: string, handle: string, title: string, thumbnail: string) {
  try {
    const key = "recently_viewed"
    const stored: RecentItem[] = JSON.parse(localStorage.getItem(key) || "[]")
    const filtered = stored.filter((p) => p.id !== productId)
    filtered.unshift({ id: productId, handle, title, thumbnail })
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)))
  } catch { /* localStorage unavailable or full — silently skip */ }
}

function getRecentlyViewed(excludeId: string): RecentItem[] {
  try {
    const stored: RecentItem[] = JSON.parse(localStorage.getItem("recently_viewed") || "[]")
    return stored.filter((p) => p.id !== excludeId).slice(0, 6)
  } catch { return [] }
}

// ── Safe price formatter ──

function safeFormatPrice(amount: number | null | undefined, currency: string | null | undefined): string | null {
  if (amount == null || !currency) return null
  return formatPrice(amount, currency)
}

// ── Tabs ──

function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0)
  return (
    <div role="tablist">
      <div className="flex border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={`py-3 px-1 mr-6 text-[11px] uppercase tracking-[0.15em] transition-colors cursor-pointer ${
              active === i ? "text-foreground border-b border-foreground -mb-px" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4 text-[13px] text-muted-foreground leading-relaxed">
        {tabs[active].content}
      </div>
    </div>
  )
}

// ── Feature block ──

function FeatureBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-5 h-5 text-muted-foreground mt-0.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </div>
      <div>
        <p className="text-[12px] font-medium">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{text}</p>
      </div>
    </div>
  )
}

// ── Product card ──

function ProductCard({ product }: { product: Product }) {
  const priceData = getProductPrice(product)
  const thumbnail = product.thumbnail || product.images?.[0]?.url
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden">
        {thumbnail && (
          <Image src={thumbnail} alt={`${product.title} — Ice Industry`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 45vw, 25vw" loading="lazy" />
        )}
      </div>
      <div className="mt-2.5">
        <p className="text-[12px] leading-tight line-clamp-1 group-hover:text-black/60 transition-colors">{product.title}</p>
        {priceData && <p className="text-[12px] text-muted-foreground mt-0.5">{formatPrice(priceData.amount, priceData.currencyCode)}</p>}
      </div>
    </Link>
  )
}

// ── Recent card ──

function RecentCard({ item }: { item: RecentItem }) {
  return (
    <Link href={`/products/${item.handle}`} className="group block">
      <div className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden">
        {item.thumbnail && (
          <Image src={item.thumbnail} alt={`${item.title} — Ice Industry`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 45vw, 25vw" loading="lazy" />
        )}
      </div>
      <p className="mt-2.5 text-[12px] leading-tight line-clamp-1 group-hover:text-black/60 transition-colors">{item.title}</p>
    </Link>
  )
}

// ── Main PDP ──

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem, error: cartError } = useCart()
  const { regionId } = useRegion()
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [addError, setAddError] = useState("")
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    }
  }, [])

  // ── Recently viewed ──
  useEffect(() => {
    addToRecentlyViewed(product.id, product.handle || "", product.title, product.thumbnail || product.images?.[0]?.url || "")
  }, [product.id, product.handle, product.title, product.thumbnail, product.images])

  const [recentlyViewed, setRecentlyViewed] = useState<RecentItem[]>([])
  useEffect(() => { setRecentlyViewed(getRecentlyViewed(product.id)) }, [product.id])

  // ── Options ──
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (product.variants?.length === 1 && product.options) {
      const defaults: Record<string, string> = {}
      product.options.forEach((opt) => { if (opt.values?.[0]) defaults[opt.id] = opt.values[0].value })
      return defaults
    }
    const colorOpt = product.options?.find((o) => ["color", "couleur"].includes(o.title?.toLowerCase() || ""))
    if (colorOpt?.values?.[0]) return { [colorOpt.id]: colorOpt.values[0].value }
    return {}
  })

  const selectedVariant = useMemo(() => {
    if (!product.variants || !product.options) return null
    return product.variants.find((variant) =>
      product.options!.every((option) => {
        const sel = selectedOptions[option.id]
        if (!sel) return false
        return variant.options?.find((vo) => vo.option_id === option.id)?.value === sel
      })
    ) ?? null
  }, [product, selectedOptions])

  const price = selectedVariant?.calculated_price ?? product.variants?.[0]?.calculated_price
  const priceLabel = safeFormatPrice(price?.calculated_amount, price?.currency_code)
  const compareAtPrice = getCompareAtPrice(product)
  const compareLabel = compareAtPrice && price?.currency_code && compareAtPrice > (price?.calculated_amount ?? 0)
    ? safeFormatPrice(compareAtPrice, price.currency_code) : null

  // ── Color images ──
  const imagesRef = useRef<ProductImagesHandle>(null)
  const colorImagesMap = useMemo(() => getColorImages(product), [product])
  const colorOpt = product.options?.find((o) => ["color", "couleur"].includes(o.title?.toLowerCase() || ""))
  const selectedColor = colorOpt ? selectedOptions[colorOpt.id] : null

  const displayImages = useMemo(() => {
    if (selectedColor && colorImagesMap[selectedColor]?.length) {
      return colorImagesMap[selectedColor].map((img, i) => ({ id: `color-${i}`, url: img.url }))
    }
    return product.images || []
  }, [selectedColor, colorImagesMap, product.images])

  const onOptionChange = useCallback((optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
  }, [])

  // ── Add to cart with proper cleanup ──
  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant?.id) return
    setAddingToCart(true)
    setAddError("")
    try {
      await addItem(selectedVariant.id, 1)
      if (!isMounted.current) return
      setAddedToCart(true)
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
      addedTimerRef.current = setTimeout(() => {
        if (isMounted.current) setAddedToCart(false)
      }, 2000)
    } catch (err) {
      if (!isMounted.current) return
      setAddError(err instanceof Error ? err.message : "Erreur lors de l'ajout au panier")
    } finally {
      if (isMounted.current) setAddingToCart(false)
    }
  }, [selectedVariant, addItem])

  // ── Cross-sell ──
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  useEffect(() => {
    let cancelled = false
    sdk.client.fetch<{ related_product_ids: string[] }>(`/store/products/${product.id}/related`, { method: "GET" })
      .then((res) => {
        const ids = res.related_product_ids || []
        if (ids.length > 0 && !cancelled) {
          return sdk.store.product.list({ id: ids, region_id: regionId || DEFAULT_REGION, fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata", limit: 4 })
        }
      })
      .then((res) => { if (res && !cancelled) setRelatedProducts((res.products as Product[]) || []) })
      .catch(() => { /* No related products module or no associations */ })
    return () => { cancelled = true }
  }, [product.id, regionId])

  // ── "You May Also Like" ──
  const [alsoLikeProducts, setAlsoLikeProducts] = useState<Product[]>([])
  useEffect(() => {
    let cancelled = false
    sdk.store.product.list({ region_id: regionId || DEFAULT_REGION, fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata", limit: 8, order: "-created_at" })
      .then(({ products }) => { if (!cancelled) setAlsoLikeProducts(((products as Product[]) || []).filter((p) => p.id !== product.id).slice(0, 6)) })
      .catch(() => { /* API unavailable */ })
    return () => { cancelled = true }
  }, [product.id, regionId])

  // ── Derived ──
  const categories = (product as unknown as Record<string, unknown>).categories as { name: string; handle?: string }[] | undefined
  const categoryLabel = categories?.[0]?.name
  const categoryHandle = categories?.[0]?.handle
  const modelInfo = (product.metadata as Record<string, unknown> | null)?.model_info as string | undefined
  const features = (product.metadata as Record<string, unknown> | null)?.features as { title: string; text: string }[] | undefined

  const canAddToCart = !!selectedVariant?.id
  const inStock = selectedVariant ? (selectedVariant.inventory_quantity ?? 1) > 0 : false
  const lowStock = selectedVariant != null && (selectedVariant.inventory_quantity ?? 0) > 0 && (selectedVariant.inventory_quantity ?? 0) <= 3

  const missingOptions = useMemo(() => {
    if (!product.options) return []
    return product.options.filter((opt) => !selectedOptions[opt.id]).map((opt) => {
      const t = opt.title?.toLowerCase() || ""
      if (["color", "couleur"].includes(t)) return "une couleur"
      if (["size", "taille", "pointure"].includes(t)) return "une taille"
      return opt.title
    })
  }, [product.options, selectedOptions])

  const ctaLabel = useMemo(() => {
    if (addingToCart) return "Ajout..."
    if (addedToCart) return "Ajouté au panier"
    if (canAddToCart && !inStock) return "Épuisé"
    if (missingOptions.length > 0) return `Sélectionnez ${missingOptions.join(" et ")}`
    return "Ajouter au panier"
  }, [addingToCart, addedToCart, canAddToCart, inStock, missingOptions])

  const ctaLabelWithPrice = useMemo(() => {
    if (addingToCart || addedToCart || (canAddToCart && !inStock) || missingOptions.length > 0) return ctaLabel
    return priceLabel ? `Ajouter au panier — ${priceLabel}` : "Ajouter au panier"
  }, [ctaLabel, addingToCart, addedToCart, canAddToCart, inStock, missingOptions, priceLabel])

  return (
    <div className="animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="px-6 lg:px-12 py-3 text-[11px] text-muted-foreground" aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground transition-colors">Accueil</Link></li>
          <li className="text-border">/</li>
          {categoryLabel && categoryHandle && (
            <>
              <li><Link href={`/categories/${categoryHandle}`} className="hover:text-foreground transition-colors">{categoryLabel}</Link></li>
              <li className="text-border">/</li>
            </>
          )}
          <li className="text-foreground truncate max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      {/* Layout */}
      <div className="lg:grid lg:grid-cols-2">
        <ProductImages ref={imagesRef} images={displayImages} productTitle={product.title} />

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="px-6 lg:px-12 pt-5 lg:pt-10 pb-32 lg:pb-16">
            {categoryLabel && <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">{categoryLabel}</p>}

            <h1 className="text-[15px] lg:text-[17px] font-medium uppercase tracking-[0.08em]">{product.title}</h1>

            <div className="flex items-baseline gap-2 mt-1.5 mb-6">
              {priceLabel && <span className="text-[14px] tracking-[0.03em]">{priceLabel}</span>}
              {compareLabel && <span className="text-[13px] text-muted-foreground line-through">{compareLabel}</span>}
            </div>

            <ProductOptions product={product} selectedOptions={selectedOptions} onOptionChange={onOptionChange} selectedVariant={selectedVariant} modelInfo={modelInfo} />

            {lowStock && <p className="text-[11px] text-red-600 mt-3">Plus que {selectedVariant?.inventory_quantity} en stock</p>}

            {/* Error feedback */}
            {(addError || cartError) && (
              <p className="text-[11px] text-red-600 mt-3">{addError || cartError}</p>
            )}

            {/* CTA desktop */}
            <div className="mt-6 hidden lg:block">
              <button onClick={handleAddToCart} disabled={!canAddToCart || addingToCart || !inStock} aria-busy={addingToCart}
                className={`w-full h-[52px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer ${!canAddToCart || !inStock ? "bg-muted text-muted-foreground cursor-not-allowed" : addedToCart ? "bg-foreground text-background" : "bg-foreground text-background hover:bg-foreground/90"}`}>
                {ctaLabel}
              </button>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-6 mt-5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 010 8h-1" /></svg>
                Retours sous 14 jours
              </span>
            </div>

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

            {/* Tabs */}
            <div className="mt-6 pt-6 border-t border-border">
              <Tabs tabs={[
                {
                  label: "Détails",
                  content: (
                    <div className="space-y-3">
                      {product.description && <p>{product.description}</p>}
                      {product.material && <p>Composition : {product.material}</p>}
                      {features && features.length > 0 && (
                        <div className="grid grid-cols-1 gap-3 mt-4">
                          {features.map((f, i) => <FeatureBlock key={i} title={f.title} text={f.text} />)}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  label: "Livraison & Retours",
                  content: (
                    <div className="space-y-1.5">
                      <p>Livraison standard : 3-5 jours ouvrés</p>
                      <p>Livraison express : 1-2 jours ouvrés</p>
                      <p className="mt-3">Retours gratuits sous 14 jours en France métropolitaine.</p>
                      <p>Les articles doivent être retournés dans leur état d&apos;origine, non portés, avec les étiquettes.</p>
                    </div>
                  ),
                },
              ]} />
            </div>

            {/* Cross-sell */}
            {relatedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] mb-4">Complétez le look</h3>
                <div className="grid grid-cols-2 gap-3">
                  {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* "Vous aimerez aussi" */}
      {alsoLikeProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Recommandations">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {alsoLikeProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Récemment consultés */}
      {recentlyViewed.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Récemment consultés">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Récemment consultés</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {recentlyViewed.map((item) => <RecentCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Sticky mobile CTA */}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <button onClick={handleAddToCart} disabled={!canAddToCart || addingToCart || !inStock} aria-busy={addingToCart}
              className={`w-full h-[52px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all ${!canAddToCart || !inStock ? "bg-muted text-muted-foreground cursor-not-allowed" : addedToCart ? "bg-foreground text-background" : "bg-foreground text-background cursor-pointer"}`}>
              {ctaLabelWithPrice}
            </button>
          </div>,
          document.body
        )}
    </div>
  )
}
