"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import ProductImages from "@/components/product/ProductImages"
import ProductOptions from "@/components/product/ProductOptions"
import ProductCard from "@/components/product/ProductCard"
import AddToCartButton from "@/components/product/AddToCartButton"
import QuickSelectDrawer from "@/components/product/QuickSelectDrawer"
import { InfoOverlay, MobileInfoAccordion, INFO_TABS } from "@/components/product/ProductInfo"
import type { ProductImagesHandle } from "@/components/product/ProductImages"
import type { EditorialBlock } from "@/components/product/ProductImages"
import { formatPrice, getProductPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import { useRegion } from "@/providers/RegionProvider"
import { DEFAULT_REGION } from "@/lib/constants"
import { PRODUCT_FIELDS } from "@/lib/medusa/products"
import { sdk } from "@/lib/sdk"
import { getColorImages, getCompareAtPrice } from "@/lib/product-helpers"
import type { Product, ProductMetadata } from "@/types"

// ── Recently Viewed (localStorage — stores IDs only) ──

function addToRecentlyViewed(productId: string) {
  try {
    const key = "recently_viewed"
    const raw = localStorage.getItem(key)
    let stored: string[] = []
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
        stored = parsed.map((p: { id: string }) => p.id).filter(Boolean)
      } else {
        stored = parsed
      }
    }
    const filtered = stored.filter((id) => id !== productId)
    filtered.unshift(productId)
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)))
  } catch { /* localStorage unavailable */ }
}

function getRecentlyViewedIds(excludeId: string): string[] {
  try {
    const raw = localStorage.getItem("recently_viewed")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
      return parsed.map((p: { id: string }) => p.id).filter((id: string) => id !== excludeId).slice(0, 4)
    }
    return (parsed as string[]).filter((id) => id !== excludeId).slice(0, 4)
  } catch { return [] }
}

// ── Safe price formatter ──

function safeFormatPrice(amount: number | null | undefined, currency: string | null | undefined): string | null {
  if (amount == null || !currency) return null
  return formatPrice(amount, currency)
}

// ── Size option helper (used to avoid repeated inline lookups) ──

function findSizeOption(product: Product) {
  return product.options?.find((o) =>
    ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || "")
  )
}

// ── Main PDP ──

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem, error: cartError } = useCart()
  const { regionId } = useRegion()
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [addError, setAddError] = useState("")
  const [activeInfoPanel, setActiveInfoPanel] = useState<string | null>(null)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileCtaRef = useRef<HTMLDivElement>(null)
  const desktopCtaRef = useRef<HTMLDivElement>(null)
  const [showStickyMobileCta, setShowStickyMobileCta] = useState(false)
  const [showDesktopMiniCta, setShowDesktopMiniCta] = useState(false)
  const [quickSelectOpen, setQuickSelectOpen] = useState(false)

  // Cleanup added-to-cart timer on unmount
  useEffect(() => {
    return () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current) }
  }, [])

  // ── CTA visibility observers ──
  useEffect(() => {
    const el = mobileCtaRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setShowStickyMobileCta(!entry.isIntersecting), { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = desktopCtaRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setShowDesktopMiniCta(!entry.isIntersecting), { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Recently viewed ──
  useEffect(() => { addToRecentlyViewed(product.id) }, [product.id])

  // ── Options state ──
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

  // ── Derived values computed once ──
  const metadata = product.metadata as ProductMetadata | null
  const sizeOption = findSizeOption(product)
  const selectedSize = sizeOption ? selectedOptions[sizeOption.id] || "" : ""
  const categoryLabel = product.categories?.[0]?.name
  const categoryHandle = product.categories?.[0]?.handle
  const modelInfo = metadata?.model_info
  const editorial = metadata?.editorial as EditorialBlock[] | undefined

  const price = selectedVariant?.calculated_price ?? product.variants?.[0]?.calculated_price
  const priceLabel = safeFormatPrice(price?.calculated_amount, price?.currency_code)
  const compareAtPrice = getCompareAtPrice(product)
  const compareLabel = compareAtPrice && price?.currency_code && compareAtPrice > (price?.calculated_amount ?? 0) ? safeFormatPrice(compareAtPrice, price.currency_code) : null

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

  // ── Consolidated add-to-cart handler ──
  const handleAddToCart = useCallback(async (variantId?: string) => {
    const id = variantId || selectedVariant?.id
    if (!id) return
    setAddingToCart(true)
    setAddError("")
    try {
      await addItem(id, 1)
      setAddedToCart(true)
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
      addedTimerRef.current = setTimeout(() => setAddedToCart(false), 2000)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Erreur")
    } finally {
      setAddingToCart(false)
    }
  }, [selectedVariant, addItem])

  // ── Drawer add-to-cart (auto-closes after success) ──
  const handleDrawerAdd = useCallback(async (variantId: string) => {
    setAddingToCart(true)
    setAddError("")
    try {
      await addItem(variantId, 1)
      setAddedToCart(true)
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
      addedTimerRef.current = setTimeout(() => { setAddedToCart(false); setQuickSelectOpen(false) }, 1500)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Erreur")
    } finally {
      setAddingToCart(false)
    }
  }, [addItem])

  // ── Recommendations: related products + cascade ──
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [alsoLikeProducts, setAlsoLikeProducts] = useState<Product[]>([])
  const [alsoLikeVisible, setAlsoLikeVisible] = useState(8)

  useEffect(() => {
    let cancelled = false
    const region = regionId || DEFAULT_REGION

    async function fetchRecommendations() {
      // Fetch manual related products
      let related: Product[] = []
      try {
        const res = await sdk.client.fetch<{ related_product_ids: string[] }>(`/store/products/${product.id}/related`, { method: "GET" })
        const ids = res.related_product_ids || []
        if (ids.length > 0 && !cancelled) {
          const { products } = await sdk.store.product.list({ id: ids, ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: ids.length })
          related = (products as Product[]) || []
          if (!cancelled) setRelatedProducts(related)
        }
      } catch { /* no related products */ }

      if (cancelled) return

      // Cascade: same collection → same category → recent
      const excludeIds = new Set<string>([product.id, ...related.map((p) => p.id)])
      const results: Product[] = []
      const addIfNew = (prods: Product[]) => {
        for (const p of prods) {
          if (results.length >= 24) break
          if (!excludeIds.has(p.id)) { excludeIds.add(p.id); results.push(p) }
        }
      }

      const collectionId = product.collection_id
      if (collectionId) {
        try {
          const { products } = await sdk.store.product.list({ collection_id: [collectionId], ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 24, order: "-created_at" })
          addIfNew(products as Product[])
        } catch { /* skip */ }
      }

      const categoryId = product.categories?.[0]?.id
      if (categoryId && results.length < 24) {
        try {
          const { products } = await sdk.store.product.list({ category_id: [categoryId], ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 24, order: "-created_at" })
          addIfNew(products as Product[])
        } catch { /* skip */ }
      }

      if (results.length < 24) {
        try {
          const { products } = await sdk.store.product.list({ ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 24, order: "-created_at" })
          addIfNew(products as Product[])
        } catch { /* skip */ }
      }

      if (!cancelled) { setAlsoLikeProducts(results); setAlsoLikeVisible(8) }
    }

    fetchRecommendations()
    return () => { cancelled = true }
  }, [product.id, product.collection_id, product.categories, regionId])

  // ── Recently viewed products ──
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  useEffect(() => {
    const ids = getRecentlyViewedIds(product.id)
    if (ids.length === 0) return
    const region = regionId || DEFAULT_REGION
    sdk.store.product.list({ id: ids, ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 4 })
      .then(({ products }) => setRecentProducts(products as Product[]))
      .catch(() => {})
  }, [product.id, regionId])

  // ── CTA state ──
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

  const onCtaClick = canAddToCart && inStock ? () => handleAddToCart() : () => setQuickSelectOpen(true)

  // ── Inline CTA labels ──
  const mobileCta = addingToCart ? "Ajout..." : addedToCart ? "Ajouté ✓" : canAddToCart && inStock ? `Ajouter · ${selectedColor || ""}` : "Sélectionner une taille"
  const desktopCtaContent = addingToCart ? "Ajout..." : addedToCart ? "Ajouté ✓" : canAddToCart && inStock ? (
    <>Ajouter<span className="opacity-40">·</span>{selectedColor || ""}<span className="opacity-40">·</span>{selectedSize}</>
  ) : "Sélectionner une taille"

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

      {/* Layout: images + info */}
      <div className="lg:grid lg:gap-12" style={{ gridTemplateColumns: "1.25fr 1fr" }}>
        <ProductImages ref={imagesRef} images={displayImages} productTitle={product.title} editorialBlocks={editorial} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative px-6 lg:pl-14 lg:pr-4 pt-5 lg:pt-1 pb-8 lg:pb-16">
            {/* Category micro-label */}
            {categoryLabel && (
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{categoryLabel}</p>
            )}

            <h1 className="text-[24px] lg:text-[28px] font-medium tracking-[-0.02em] leading-[1.1] mt-3">{product.title}</h1>

            {/* Price */}
            <div className="mt-4">
              <span className="text-[17px] font-medium tracking-[-0.01em]">{priceLabel}</span>
              {compareLabel && <span className="text-[14px] text-[var(--color-muted)] line-through ml-2.5">{compareLabel}</span>}
            </div>

            <div className="h-px bg-[var(--color-border)] my-5" />

            <ProductOptions product={product} selectedOptions={selectedOptions} onOptionChange={onOptionChange} selectedVariant={selectedVariant} modelInfo={modelInfo} />

            {/* Low stock indicator */}
            {lowStock && (
              <div className="flex items-center gap-2 mt-2.5 font-mono text-[10px] tracking-[0.14em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Derniers exemplaires — Taille {selectedSize}
              </div>
            )}

            {/* Cart feedback */}
            <div aria-live="polite">
              {(addError || cartError) && <p className="text-[11px] text-red-600 mt-3">{addError || cartError}</p>}
            </div>

            {/* Mobile inline CTA */}
            <div ref={mobileCtaRef} className="mt-5 lg:hidden">
              <AddToCartButton onClick={onCtaClick} adding={addingToCart} added={addedToCart} canAdd={canAddToCart && inStock} label={mobileCta} price={priceLabel} />
            </div>

            {/* Desktop inline CTA */}
            <div ref={desktopCtaRef} className="mt-5 hidden lg:block">
              <button
                onClick={onCtaClick}
                aria-busy={addingToCart}
                className="w-full h-[52px] flex items-center justify-between px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer border-none"
                style={{ background: "var(--color-ink)", color: "var(--color-surface)" }}
              >
                <span className="flex items-center gap-2">{desktopCtaContent}</span>
                {priceLabel && <span className="tracking-[0.04em]">{priceLabel}</span>}
              </button>
            </div>

            {/* Reassurance grid */}
            <div className="mt-5 grid grid-cols-3 border-t border-b border-[var(--color-border)]">
              {[
                { t: "Livraison", d: "Offerte dès 80 €" },
                { t: "Retours", d: "30 jours gratuits" },
                { t: "Boutique", d: "Retrait 24h · Marseille" },
              ].map((r, i) => (
                <div key={r.t} className="py-4 px-3.5" style={{ borderLeft: i > 0 ? "1px solid var(--color-border)" : "none" }}>
                  <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--color-muted)]">{r.t}</p>
                  <p className="mt-1.5 text-[13px] leading-snug">{r.d}</p>
                </div>
              ))}
            </div>

            {/* Desktop: Info tab rows */}
            <div className="hidden lg:block mt-6 border-t border-[var(--color-border)]">
              {INFO_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveInfoPanel(t.key)}
                  className="w-full bg-transparent border-none border-b border-[var(--color-border)] py-5 px-0.5 flex justify-between items-center cursor-pointer text-left transition-all hover:pl-2.5"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase">{t.label}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="var(--color-ink)" strokeWidth="1.2" /></svg>
                </button>
              ))}
            </div>

            <InfoOverlay activeKey={activeInfoPanel} onOpen={setActiveInfoPanel} onClose={() => setActiveInfoPanel(null)} product={product} />
            <MobileInfoAccordion product={product} />
          </div>
        </div>
      </div>

      {/* Section A: Related products */}
      {relatedProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Complétez le look">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Complétez le look</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Section B: "Vous aimerez aussi" cascade */}
      {alsoLikeProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Recommandations">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
            {alsoLikeProducts.slice(0, alsoLikeVisible).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {alsoLikeVisible < alsoLikeProducts.length && (
            <div className="flex justify-center mt-8">
              <button onClick={() => setAlsoLikeVisible((v) => Math.min(v + 8, alsoLikeProducts.length))}
                className="text-[11px] font-medium uppercase tracking-[0.15em] group relative cursor-pointer">
                <span className="relative">
                  Charger plus
                  <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current origin-right transition-transform duration-300 group-hover:scale-x-0" />
                  <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current scale-x-0 origin-left transition-transform duration-300 delay-200 group-hover:scale-x-100" />
                </span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Section C: Recently viewed */}
      {recentProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Récemment consultés">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Récemment consultés</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
            {recentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Desktop mini CTA bar — fixed top when inline CTA scrolls out */}
      {createPortal(
        <div
          className="hidden lg:block fixed top-0 left-0 right-0 z-40 transition-all duration-300 overflow-hidden"
          style={{
            maxHeight: showDesktopMiniCta ? 80 : 0,
            opacity: showDesktopMiniCta ? 1 : 0,
            pointerEvents: showDesktopMiniCta ? "auto" : "none",
          }}
        >
          <div className="bg-white border-b border-[var(--color-border)] py-3 px-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-[14px] font-medium tracking-[-0.01em]">{product.title}</span>
              <div className="flex items-center gap-2 text-[12px] text-[var(--color-muted)]">
                {selectedColor && <span>{selectedColor}</span>}
                {selectedColor && selectedSize && <span className="opacity-40">·</span>}
                {selectedSize && <span>{selectedSize}</span>}
              </div>
            </div>
            <div className="flex items-center gap-6">
              {priceLabel && <span className="text-[14px] font-medium">{priceLabel}</span>}
              <button
                onClick={onCtaClick}
                aria-busy={addingToCart}
                className="h-[40px] px-6 text-[10px] font-medium uppercase tracking-[0.18em] border-none cursor-pointer transition-all"
                style={{ background: "var(--color-ink)", color: "var(--color-surface)" }}
              >
                {addingToCart ? "Ajout..." : addedToCart ? "Ajouté ✓" : canAddToCart && inStock ? "Ajouter au panier" : "Sélectionner une taille"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sticky mobile CTA — fixed bottom when inline CTA scrolls out */}
      {createPortal(
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            transform: showStickyMobileCta ? "translateY(0)" : "translateY(100%)",
            opacity: showStickyMobileCta ? 1 : 0,
            pointerEvents: showStickyMobileCta ? "auto" : "none",
          }}
        >
          <div
            className="border-t border-[var(--color-border)]/70"
            style={{
              background: "rgba(250,250,248,0.9)",
              backdropFilter: "blur(16px) saturate(170%)",
              WebkitBackdropFilter: "blur(16px) saturate(170%)",
              padding: "12px 14px calc(12px + env(safe-area-inset-bottom, 20px))",
            }}
          >
            <AddToCartButton onClick={onCtaClick} adding={addingToCart} added={addedToCart} canAdd={canAddToCart && inStock} label={mobileCta} price={priceLabel} />
          </div>
        </div>,
        document.body
      )}

      {/* Quick Select Drawer */}
      <QuickSelectDrawer
        open={quickSelectOpen}
        onClose={() => setQuickSelectOpen(false)}
        product={product}
        onAddToCart={handleDrawerAdd}
        adding={addingToCart}
        added={addedToCart}
      />
    </div>
  )
}
