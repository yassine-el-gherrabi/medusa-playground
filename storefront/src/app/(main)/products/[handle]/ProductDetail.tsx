"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import ProductImages from "@/components/product/ProductImages"
import ProductOptions from "@/components/product/ProductOptions"
import ProductCard from "@/components/product/ProductCard"
import type { ProductImagesHandle } from "@/components/product/ProductImages"
import { formatPrice, getProductPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import { useRegion } from "@/providers/RegionProvider"
import { DEFAULT_REGION } from "@/lib/constants"
import { PRODUCT_FIELDS } from "@/lib/medusa/products"
import { sdk } from "@/lib/sdk"
import { getColorImages, getCompareAtPrice } from "@/lib/product-helpers"
import type { EditorialBlock } from "@/components/product/ProductImages"
import type { Product } from "@/types"

// ── Recently Viewed (localStorage — stores IDs only) ──

function addToRecentlyViewed(productId: string) {
  try {
    const key = "recently_viewed"
    const raw = localStorage.getItem(key)
    let stored: string[] = []
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migration: old format stored objects, new stores IDs
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

// ── Info tab data ──

const INFO_TABS = [
  {
    key: "details",
    label: "Détails & Matière",
    kicker: "01",
  },
  {
    key: "care",
    label: "Entretien",
    kicker: "02",
  },
  {
    key: "shipping",
    label: "Livraison & Retours",
    kicker: "03",
  },
]

// ── Info overlay panel ──

function InfoOverlay({
  activeKey,
  onOpen,
  onClose,
  product,
}: {
  activeKey: string | null
  onOpen: (key: string) => void
  onClose: () => void
  product: Product
}) {
  const tab = INFO_TABS.find((t) => t.key === activeKey)
  const isOpen = !!tab

  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [isOpen, onClose])

  const bodyContent: Record<string, React.ReactNode> = {
    details: (
      <>
        {product.description && <p className="mb-0">{product.description}</p>}
        {product.material && (
          <dl className="mt-9 grid gap-y-4 gap-x-6 text-[14px]" style={{ gridTemplateColumns: "160px 1fr" }}>
            {[
              ["Matière", product.material],
              ...(product.weight ? [["Poids", `${product.weight}g`]] : []),
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#6F6E6A] pt-0.5">{k}</dt>
                <dd className="m-0 leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </>
    ),
    care: (
      <>
        <p>Pour préserver la matière et les finitions sur le long terme, nous recommandons un entretien doux.</p>
        <ul className="mt-8 p-0 list-none border-t border-[#E3E1DC]">
          {[
            "Lavage 30°C à l'envers",
            "Repassage doux au dos de l'impression",
            "Ne pas sécher en machine",
            "Ne pas nettoyer à sec",
          ].map((t) => (
            <li key={t} className="py-4 border-b border-[#E3E1DC] flex items-center gap-4 text-[14px]">
              <span className="w-1 h-1 rounded-full bg-[#0A0A0A] shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </>
    ),
    shipping: (
      <>
        <p>Expédition rapide depuis Marseille, emballage signature Ice Industry.</p>
        <div className="mt-9 grid grid-cols-2 gap-px bg-[#E3E1DC] border border-[#E3E1DC]">
          {[
            ["Standard", "Offerte dès 80 €", "3–5 jours ouvrés"],
            ["Express", "9,90 €", "J+1 en France"],
            ["Retrait boutique", "Gratuit", "Marseille · 24h"],
            ["International", "Dès 14,90 €", "Europe · Monde"],
          ].map(([t, p, d]) => (
            <div key={t} className="bg-[#FAFAF8] p-5">
              <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#6F6E6A]">{t}</div>
              <div className="mt-2.5 text-[17px] font-medium tracking-[-0.01em]">{p}</div>
              <div className="mt-1 text-[12px] text-[#1F1F1F]">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-7 text-[13px] text-[#1F1F1F] leading-relaxed">
          Retours gratuits sous 30 jours. Remboursement sous 5 jours ouvrés après réception.
        </p>
      </>
    ),
  }

  return (
    <div
      aria-hidden={!isOpen}
      className="absolute inset-0 bg-[#FAFAF8] flex flex-col transition-all duration-300"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transform: isOpen ? "translateY(0)" : "translateY(12px)",
        paddingLeft: 56,
        paddingRight: 8,
      }}
    >
      {tab && (
        <>
          <div className="flex justify-between items-center pt-1 pb-6">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[10px] tracking-[0.18em] text-[#6F6E6A]">{tab.kicker} /</span>
              <h2 className="text-[32px] font-medium tracking-[-0.025em] m-0">{tab.label}</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-[0.18em] uppercase p-0"
            >
              Fermer
              <span className="w-[34px] h-[34px] border border-[#0A0A0A] flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1 1l9 9M10 1l-9 9" stroke="#0A0A0A" strokeWidth="1.2" /></svg>
              </span>
            </button>
          </div>

          <div className="h-px bg-[#E3E1DC]" />

          <div className="flex-1 overflow-y-auto pt-8 pb-10 text-[14px] leading-[1.7] text-[#1F1F1F]" style={{ textWrap: "pretty" }}>
            {bodyContent[tab.key]}
          </div>

          <div className="border-t border-[#E3E1DC] flex">
            {INFO_TABS.filter((t) => t.key !== tab.key).map((t, idx) => (
              <button
                key={t.key}
                onClick={() => onOpen(t.key)}
                className="flex-1 bg-transparent border-none py-4.5 px-3.5 flex justify-between items-center cursor-pointer text-left font-mono text-[10px] tracking-[0.16em] uppercase text-[#6F6E6A] hover:text-[#0A0A0A] transition-colors"
                style={{ borderLeft: idx > 0 ? "1px solid #E3E1DC" : "none" }}
              >
                <span>{t.label}</span>
                <span className="text-[14px]">→</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
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
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false; if (addedTimerRef.current) clearTimeout(addedTimerRef.current) }
  }, [])

  // ── Recently viewed ──
  useEffect(() => { addToRecentlyViewed(product.id) }, [product.id])

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

  // ── Add to cart ──
  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant?.id) return
    setAddingToCart(true); setAddError("")
    try {
      await addItem(selectedVariant.id, 1)
      if (!isMounted.current) return
      setAddedToCart(true)
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
      addedTimerRef.current = setTimeout(() => { if (isMounted.current) setAddedToCart(false) }, 2000)
    } catch (err) { if (isMounted.current) setAddError(err instanceof Error ? err.message : "Erreur") }
    finally { if (isMounted.current) setAddingToCart(false) }
  }, [selectedVariant, addItem])

  // ── Section A: "Complétez le look" (manual only) ──
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  useEffect(() => {
    let cancelled = false
    const region = regionId || DEFAULT_REGION
    sdk.client.fetch<{ related_product_ids: string[] }>(`/store/products/${product.id}/related`, { method: "GET" })
      .then((res) => {
        const ids = res.related_product_ids || []
        if (ids.length > 0 && !cancelled) {
          return sdk.store.product.list({ id: ids, ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: ids.length })
        }
      })
      .then((res) => { if (res && !cancelled) setRelatedProducts((res.products as Product[]) || []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [product.id, regionId])

  // ── Section B: "Vous aimerez aussi" (cascade) ──
  const [alsoLikeProducts, setAlsoLikeProducts] = useState<Product[]>([])
  const [alsoLikeVisible, setAlsoLikeVisible] = useState(8)

  useEffect(() => {
    let cancelled = false
    const region = regionId || DEFAULT_REGION
    const excludeIds = new Set<string>([product.id])

    async function cascade() {
      const results: Product[] = []
      const addIfNew = (prods: Product[]) => {
        for (const p of prods) {
          if (results.length >= 24) break
          if (!excludeIds.has(p.id)) { excludeIds.add(p.id); results.push(p) }
        }
      }

      // Wait for relatedProducts to populate excludeIds
      // (small delay to let the other effect run first)
      await new Promise((r) => setTimeout(r, 200))
      relatedProducts.forEach((p) => excludeIds.add(p.id))

      // 1. Same collection
      const collectionId = (product as unknown as Record<string, unknown>).collection_id as string | undefined
      if (collectionId) {
        try {
          const { products } = await sdk.store.product.list({ collection_id: [collectionId], ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 24, order: "-created_at" })
          addIfNew(products as Product[])
        } catch {}
      }

      // 2. Same category
      const categories = (product as unknown as Record<string, unknown>).categories as { id: string }[] | undefined
      const categoryId = categories?.[0]?.id
      if (categoryId && results.length < 24) {
        try {
          const { products } = await sdk.store.product.list({ category_id: [categoryId], ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 24, order: "-created_at" })
          addIfNew(products as Product[])
        } catch {}
      }

      // 3. Recent products
      if (results.length < 24) {
        try {
          const { products } = await sdk.store.product.list({ ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 24, order: "-created_at" })
          addIfNew(products as Product[])
        } catch {}
      }

      if (!cancelled) { setAlsoLikeProducts(results); setAlsoLikeVisible(8) }
    }

    cascade()
    return () => { cancelled = true }
  }, [product.id, regionId, relatedProducts])

  // ── Section C: "Récemment consultés" (fetch from localStorage IDs) ──
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  useEffect(() => {
    const ids = getRecentlyViewedIds(product.id)
    if (ids.length === 0) return
    const region = regionId || DEFAULT_REGION
    sdk.store.product.list({ id: ids, ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 4 })
      .then(({ products }) => setRecentProducts(products as Product[]))
      .catch(() => {})
  }, [product.id, regionId])

  // ── Derived ──
  const categories = (product as unknown as Record<string, unknown>).categories as { name: string; handle?: string }[] | undefined
  const categoryLabel = categories?.[0]?.name
  const categoryHandle = categories?.[0]?.handle
  const modelInfo = (product.metadata as Record<string, unknown> | null)?.model_info as string | undefined
  const features = (product.metadata as Record<string, unknown> | null)?.features as { title: string; text: string }[] | undefined
  const editorial = (product.metadata as Record<string, unknown> | null)?.editorial as EditorialBlock[] | undefined

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

      {/* Layout: images + info */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-16">
        <ProductImages ref={imagesRef} images={displayImages} productTitle={product.title} editorialBlocks={editorial} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative px-6 lg:pl-14 lg:pr-4 pt-5 lg:pt-1 pb-32 lg:pb-16">
            {/* Category micro-label */}
            {categoryLabel && (
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6F6E6A]">{categoryLabel}</p>
            )}

            {/* Title — editorial, large */}
            <h1 className="text-[28px] lg:text-[clamp(36px,3.4vw,52px)] font-medium tracking-[-0.035em] leading-[1.0] mt-4">
              {product.title}
            </h1>

            {/* Price + shipping info */}
            <div className="mt-5">
              <span className="text-[22px] font-medium tracking-[-0.01em]">{priceLabel}</span>
              {compareLabel && <span className="text-[15px] text-[#6F6E6A] line-through ml-3">{compareLabel}</span>}
              <span className="text-[12px] text-[#6F6E6A] ml-2.5">TTC · Expédition offerte dès 80 €</span>
            </div>

            {/* Hairline separator */}
            <div className="h-px bg-[#E3E1DC] my-7" />

            {/* Options (color + size grid) */}
            <ProductOptions product={product} selectedOptions={selectedOptions} onOptionChange={onOptionChange} selectedVariant={selectedVariant} />

            {/* Low stock */}
            {lowStock && (
              <div className="flex items-center gap-2 mt-2.5 font-mono text-[10px] tracking-[0.14em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Derniers exemplaires — Taille {selectedOptions[product.options?.find((o) => ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || ""))?.id || ""] || ""}
              </div>
            )}

            {(addError || cartError) && <p className="text-[11px] text-red-600 mt-3">{addError || cartError}</p>}

            {/* Primary CTA — split text */}
            <div className="mt-5 hidden lg:block">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart || addingToCart || !inStock}
                aria-busy={addingToCart}
                className="w-full h-[62px] flex items-center justify-between px-6 text-[13px] font-medium uppercase tracking-[0.24em] transition-all cursor-pointer border-none"
                style={{
                  background: canAddToCart && inStock ? (addedToCart ? "#0A0A0A" : "#0A0A0A") : "#18181A",
                  color: "#FAFAF8",
                  opacity: canAddToCart && inStock ? 1 : 0.6,
                  cursor: canAddToCart && inStock ? "pointer" : "not-allowed",
                }}
              >
                <span className="flex items-center gap-2.5">
                  {addingToCart ? "Ajout..." : addedToCart ? "Ajouté ✓" : canAddToCart && inStock ? (
                    <>Ajouter au panier<span className="opacity-45">·</span>Taille {selectedOptions[product.options?.find((o) => ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || ""))?.id || ""] || ""}</>
                  ) : (
                    <>
                      {missingOptions.length > 0 ? "Sélectionner une taille" : "Épuisé"}
                      {missingOptions.length > 0 && (
                        <svg width="14" height="14" viewBox="0 0 14 14" className="opacity-60"><path d="M3 5l4 4 4-4" stroke="#FAFAF8" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>
                      )}
                    </>
                  )}
                </span>
                {priceLabel && <span className="tracking-[0.04em]">{priceLabel}</span>}
              </button>
            </div>

            {/* Reassurance — 3-column grid */}
            <div className="mt-7 grid grid-cols-3 border-t border-b border-[#E3E1DC]">
              {[
                { t: "Livraison", d: "Offerte dès 80 €" },
                { t: "Retours", d: "30 jours gratuits" },
                { t: "Boutique", d: "Retrait 24h · Marseille" },
              ].map((r, i) => (
                <div key={r.t} className="py-4 px-3.5" style={{ borderLeft: i > 0 ? "1px solid #E3E1DC" : "none" }}>
                  <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#6F6E6A]">{r.t}</p>
                  <p className="mt-1.5 text-[13px] leading-snug">{r.d}</p>
                </div>
              ))}
            </div>

            {/* Info tab rows — click to open overlay */}
            <div className="mt-8 border-t border-[#E3E1DC]">
              {INFO_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveInfoPanel(t.key)}
                  className="w-full bg-transparent border-none border-b border-[#E3E1DC] py-5 px-0.5 flex justify-between items-center cursor-pointer text-left transition-all hover:pl-2.5"
                  style={{ borderBottom: "1px solid #E3E1DC" }}
                >
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase">{t.label}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="#0A0A0A" strokeWidth="1.2" /></svg>
                </button>
              ))}
            </div>

            {/* Model info — bottom */}
            {modelInfo && (
              <div className="mt-6 pt-4.5 border-t border-[#E3E1DC] text-[12px] text-[#6F6E6A] leading-relaxed">
                {modelInfo}
              </div>
            )}

            {/* Info overlay panel */}
            <InfoOverlay activeKey={activeInfoPanel} onOpen={setActiveInfoPanel} onClose={() => setActiveInfoPanel(null)} product={product} />
          </div>
        </div>
      </div>

      {/* ── Section A: "Complétez le look" (manual only) ── */}
      {relatedProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Complétez le look">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Complétez le look</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Section B: "Vous aimerez aussi" (cascade) ── */}
      {alsoLikeProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Recommandations">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
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

      {/* ── Section C: "Récemment consultés" ── */}
      {recentProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Récemment consultés">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Récemment consultés</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {recentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
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
