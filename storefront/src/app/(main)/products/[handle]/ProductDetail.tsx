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
import Image from "next/image"
import { getColorImages, getCompareAtPrice, extractColors, extractSizes, buildVariantMap, findVariantId, isSizeInStock, getColorThumbnail, COLOR_MAP } from "@/lib/product-helpers"
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

// ── Info content (shared between overlay + accordion) ──

function getInfoContent(product: Product): Record<string, React.ReactNode> {
  return {
    details: (
      <>
        {product.description && <p className="mb-0">{product.description}</p>}
        {product.material && (
          <dl className="mt-6 lg:mt-9 grid gap-y-4 gap-x-6 text-[14px]" style={{ gridTemplateColumns: "120px 1fr" }}>
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
        <ul className="mt-5 lg:mt-8 p-0 list-none border-t border-[#E3E1DC]">
          {[
            "Lavage 30°C à l'envers",
            "Repassage doux au dos de l'impression",
            "Ne pas sécher en machine",
            "Ne pas nettoyer à sec",
          ].map((t) => (
            <li key={t} className="py-3 lg:py-4 border-b border-[#E3E1DC] flex items-center gap-4 text-[13px] lg:text-[14px]">
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
        <div className="mt-6 lg:mt-9 grid grid-cols-2 gap-px bg-[#E3E1DC] border border-[#E3E1DC]">
          {[
            ["Standard", "Offerte dès 80 €", "3–5 jours ouvrés"],
            ["Express", "9,90 €", "J+1 en France"],
            ["Retrait boutique", "Gratuit", "Marseille · 24h"],
            ["International", "Dès 14,90 €", "Europe · Monde"],
          ].map(([t, p, d]) => (
            <div key={t} className="bg-white p-4 lg:p-5">
              <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#6F6E6A]">{t}</div>
              <div className="mt-2 lg:mt-2.5 text-[15px] lg:text-[17px] font-medium tracking-[-0.01em]">{p}</div>
              <div className="mt-1 text-[12px] text-[#1F1F1F]">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-5 lg:mt-7 text-[13px] text-[#1F1F1F] leading-relaxed">
          Retours gratuits sous 30 jours. Remboursement sous 5 jours ouvrés après réception.
        </p>
      </>
    ),
  }
}

// ── Mobile accordion ──

function MobileInfoAccordion({ product }: { product: Product }) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const content = getInfoContent(product)

  return (
    <div className="lg:hidden mt-4 border-t border-[#E3E1DC]">
      {INFO_TABS.map((tab) => {
        const isOpen = openKey === tab.key
        return (
          <div key={tab.key} className="border-b border-[#E3E1DC]">
            <button
              onClick={() => setOpenKey(isOpen ? null : tab.key)}
              className="w-full py-5 px-0 flex justify-between items-center cursor-pointer bg-transparent border-none text-left"
            >
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase">{tab.label}</span>
              <svg
                width="12" height="12" viewBox="0 0 12 12"
                className="transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
              >
                <path d="M6 1v10M1 6h10" stroke="#0A0A0A" strokeWidth="1.2" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: isOpen ? 600 : 0 }}
            >
              <div className="pb-5 text-[13px] leading-relaxed text-[#1F1F1F]">
                {content[tab.key]}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Desktop info overlay panel ──

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

  const bodyContent = getInfoContent(product)

  return (
    <div
      aria-hidden={!isOpen}
      className="absolute inset-0 bg-white flex flex-col transition-all duration-300"
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
              <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1 1l9 9M10 1l-9 9" stroke="#0A0A0A" strokeWidth="1.2" /></svg>
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

// ── Quick Select Drawer (slide-in for color + size selection) ──

function QuickSelectDrawer({
  open,
  onClose,
  product,
  onAddToCart,
  adding,
  added,
}: {
  open: boolean
  onClose: () => void
  product: Product
  onAddToCart: (variantId: string) => Promise<void>
  adding: boolean
  added: boolean
}) {
  const colors = extractColors(product)
  const sizes = extractSizes(product)
  const variants = buildVariantMap(product)
  const colorImages = getColorImages(product)

  const [drawerColor, setDrawerColor] = useState(colors[0]?.value || "")
  const [drawerSize, setDrawerSize] = useState("")

  // Reset on open
  useEffect(() => {
    if (open) setDrawerSize("")
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      return () => {
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        window.scrollTo(0, scrollY)
      }
    }
  }, [open])

  const canAdd = !!drawerSize && !!drawerColor
  const variantId = canAdd ? findVariantId(variants, drawerColor, drawerSize) : null
  const inStock = drawerSize ? isSizeInStock(variants, drawerColor, drawerSize) : true

  const handleAdd = async () => {
    if (!variantId) return
    await onAddToCart(variantId)
  }

  const priceData = getProductPrice(product)
  const price = priceData ? formatPrice(priceData.amount, priceData.currencyCode) : ""

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${open ? "bg-black/30 backdrop-blur-sm pointer-events-auto" : "bg-transparent backdrop-blur-none pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Sélection rapide"
        aria-modal={open}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-[61] bg-white flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#E3E1DC] shrink-0">
          <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase">Sélection rapide</h2>
          <button onClick={onClose} className="p-2 -mr-2 cursor-pointer" aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Product summary */}
          <div className="flex gap-4 mb-6 pb-6 border-b border-[#E3E1DC]">
            {product.thumbnail && (
              <div className="w-20 h-24 bg-[#f5f5f5] relative shrink-0">
                <Image src={product.thumbnail} alt={product.title} fill className="object-cover" sizes="80px" />
              </div>
            )}
            <div>
              <p className="text-[14px] font-medium">{product.title}</p>
              <p className="text-[14px] text-[#6F6E6A] mt-1">{price}</p>
            </div>
          </div>

          {/* Color */}
          {colors.length > 0 && (
            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">Couleur</p>
                <span className="text-[13px] text-[#6F6E6A]">{drawerColor}</span>
              </div>
              <div className="flex gap-2.5">
                {colors.map((c) => {
                  const thumb = getColorThumbnail(colorImages, c.value)
                  const isSelected = drawerColor === c.value
                  const color = COLOR_MAP[c.value] || "#cccccc"
                  return (
                    <button
                      key={c.value}
                      onClick={() => { setDrawerColor(c.value); setDrawerSize("") }}
                      className={`relative cursor-pointer ${thumb ? "w-16 h-20" : "w-10 h-10"}`}
                      style={!thumb ? {
                        backgroundColor: color,
                        border: isSelected ? "2px solid #0A0A0A" : "1px solid #E3E1DC",
                        boxShadow: isSelected ? "0 0 0 2px #fff inset" : "none",
                      } : undefined}
                    >
                      {thumb && (
                        <Image src={thumb} alt={c.label} fill className="object-cover" sizes="64px" />
                      )}
                      {thumb && (
                        <span className={`absolute -bottom-1.5 left-0 right-0 h-px transition-colors ${isSelected ? "bg-black" : "bg-transparent"}`} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-3">
                Taille
                {drawerSize && <span className="text-[#6F6E6A] ml-2">— {drawerSize}</span>}
              </p>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(sizes.length, 6)}, 1fr)` }}>
                {sizes.map((s) => {
                  const isSelected = drawerSize === s.value
                  const inStk = isSizeInStock(variants, drawerColor, s.value)
                  return (
                    <button
                      key={s.value}
                      onClick={() => inStk && setDrawerSize(s.value)}
                      disabled={!inStk}
                      className={`relative h-[46px] text-[13px] font-medium tracking-[0.02em] transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-[#0A0A0A] text-[#FAFAF8] border-[#0A0A0A]"
                          : !inStk
                            ? "bg-transparent text-[#A3A19C] border-[#E3E1DC] cursor-not-allowed"
                            : "bg-transparent text-[#0A0A0A] border-[#E3E1DC] hover:border-[#0A0A0A]"
                      }`}
                    >
                      {s.value}
                      {!inStk && (
                        <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="0" y1="100" x2="100" y2="0" stroke="#E3E1DC" strokeWidth="1" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Fixed bottom CTA */}
        <div className="shrink-0 px-6 py-4 border-t border-[#E3E1DC]">
          <button
            onClick={handleAdd}
            disabled={!canAdd || adding || !inStock}
            className="w-full h-[52px] flex items-center justify-between px-5 text-[11px] font-medium uppercase tracking-[0.2em] border-none cursor-pointer transition-all"
            style={{
              background: canAdd && inStock ? "#0A0A0A" : "#18181A",
              color: "#FAFAF8",
              opacity: canAdd && inStock ? 1 : 0.6,
              cursor: canAdd && inStock ? "pointer" : "not-allowed",
            }}
          >
            <span>{adding ? "Ajout..." : added ? "Ajouté ✓" : canAdd ? `Ajouter · ${drawerColor} · ${drawerSize}` : "Sélectionner une taille"}</span>
            {price && <span className="tracking-[0.04em]">{price}</span>}
          </button>
        </div>
      </div>
    </>,
    document.body
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
  const mobileCtaRef = useRef<HTMLDivElement>(null)
  const desktopCtaRef = useRef<HTMLDivElement>(null)
  const [showStickyMobileCta, setShowStickyMobileCta] = useState(false)
  const [showDesktopMiniCta, setShowDesktopMiniCta] = useState(false)
  const [quickSelectOpen, setQuickSelectOpen] = useState(false)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false; if (addedTimerRef.current) clearTimeout(addedTimerRef.current) }
  }, [])

  // ── Mobile sticky CTA visibility ──
  useEffect(() => {
    const el = mobileCtaRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyMobileCta(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Desktop mini CTA visibility ──
  useEffect(() => {
    const el = desktopCtaRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setShowDesktopMiniCta(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
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
      <div className="lg:grid lg:gap-12" style={{ gridTemplateColumns: "1.25fr 1fr" }}>
        <ProductImages ref={imagesRef} images={displayImages} productTitle={product.title} editorialBlocks={editorial} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative px-6 lg:pl-14 lg:pr-4 pt-5 lg:pt-1 pb-8 lg:pb-16">
            {/* Category micro-label */}
            {categoryLabel && (
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6F6E6A]">{categoryLabel}</p>
            )}

            {/* Title — editorial */}
            <h1 className="text-[24px] lg:text-[28px] font-medium tracking-[-0.02em] leading-[1.1] mt-3">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-4">
              <span className="text-[17px] font-medium tracking-[-0.01em]">{priceLabel}</span>
              {compareLabel && <span className="text-[14px] text-[#6F6E6A] line-through ml-2.5">{compareLabel}</span>}
            </div>

            {/* Hairline separator */}
            <div className="h-px bg-[#E3E1DC] my-5" />

            {/* Options (color + size grid) */}
            <ProductOptions product={product} selectedOptions={selectedOptions} onOptionChange={onOptionChange} selectedVariant={selectedVariant} modelInfo={modelInfo} />

            {/* Low stock */}
            {lowStock && (
              <div className="flex items-center gap-2 mt-2.5 font-mono text-[10px] tracking-[0.14em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Derniers exemplaires — Taille {selectedOptions[product.options?.find((o) => ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || ""))?.id || ""] || ""}
              </div>
            )}

            {(addError || cartError) && <p className="text-[11px] text-red-600 mt-3">{addError || cartError}</p>}

            {/* Mobile inline CTA — anchor for sticky detection */}
            <div ref={mobileCtaRef} className="mt-5 lg:hidden">
              <button
                onClick={canAddToCart && inStock ? handleAddToCart : () => setQuickSelectOpen(true)}
                aria-busy={addingToCart}
                className="w-full h-[52px] flex items-center justify-between px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer border-none"
                style={{ background: "#0A0A0A", color: "#FAFAF8" }}
              >
                <span>{addingToCart ? "Ajout..." : addedToCart ? "Ajouté ✓" : canAddToCart && inStock ? `Ajouter · ${selectedColor || ""}` : "Sélectionner une taille"}</span>
                {priceLabel && <span className="tracking-[0.04em]">{priceLabel}</span>}
              </button>
            </div>

            {/* Desktop CTA — split text */}
            <div ref={desktopCtaRef} className="mt-5 hidden lg:block">
              <button
                onClick={canAddToCart && inStock ? handleAddToCart : () => setQuickSelectOpen(true)}
                aria-busy={addingToCart}
                className="w-full h-[52px] flex items-center justify-between px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer border-none"
                style={{ background: "#0A0A0A", color: "#FAFAF8" }}
              >
                <span className="flex items-center gap-2">
                  {addingToCart ? "Ajout..." : addedToCart ? "Ajouté ✓" : canAddToCart && inStock ? (
                    <>Ajouter<span className="opacity-40">·</span>{selectedColor || ""}<span className="opacity-40">·</span>{selectedOptions[product.options?.find((o) => ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || ""))?.id || ""] || ""}</>
                  ) : "Sélectionner une taille"}
                </span>
                {priceLabel && <span className="tracking-[0.04em]">{priceLabel}</span>}
              </button>
            </div>

            {/* Reassurance — 3-column grid */}
            <div className="mt-5 grid grid-cols-3 border-t border-b border-[#E3E1DC]">
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

            {/* Desktop: Info tab rows — click to open overlay */}
            <div className="hidden lg:block mt-6 border-t border-[#E3E1DC]">
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

            {/* Desktop: Info overlay panel */}
            <InfoOverlay activeKey={activeInfoPanel} onOpen={setActiveInfoPanel} onClose={() => setActiveInfoPanel(null)} product={product} />

            {/* Mobile: Simple accordion */}
            <MobileInfoAccordion product={product} />
          </div>
        </div>
      </div>

      {/* ── Section A: "Complétez le look" (manual only) ── */}
      {relatedProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Complétez le look">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Complétez le look</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Section B: "Vous aimerez aussi" (cascade) ── */}
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

      {/* ── Section C: "Récemment consultés" ── */}
      {recentProducts.length > 0 && (
        <section className="px-6 lg:px-10 py-12 lg:py-16 border-t border-border" aria-label="Récemment consultés">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] mb-6">Récemment consultés</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
            {recentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Desktop mini CTA bar — appears when inline CTA scrolls out ── */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className="hidden lg:block fixed top-0 left-0 right-0 z-40 transition-all duration-300 overflow-hidden"
            style={{
              maxHeight: showDesktopMiniCta ? 80 : 0,
              opacity: showDesktopMiniCta ? 1 : 0,
              pointerEvents: showDesktopMiniCta ? "auto" : "none",
            }}
          >
            <div className="bg-white border-b border-[#E3E1DC] py-3 px-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-[14px] font-medium tracking-[-0.01em]">{product.title}</span>
                <div className="flex items-center gap-2 text-[12px] text-[#6F6E6A]">
                  {selectedColor && <span>{selectedColor}</span>}
                  {selectedColor && selectedOptions[product.options?.find((o) => ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || ""))?.id || ""] && <span className="opacity-40">·</span>}
                  {selectedOptions[product.options?.find((o) => ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || ""))?.id || ""] && (
                    <span>{selectedOptions[product.options?.find((o) => ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || ""))?.id || ""]}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6">
                {priceLabel && <span className="text-[14px] font-medium">{priceLabel}</span>}
                <button
                  onClick={canAddToCart && inStock ? handleAddToCart : () => setQuickSelectOpen(true)}
                  aria-busy={addingToCart}
                  className="h-[40px] px-6 text-[10px] font-medium uppercase tracking-[0.18em] border-none cursor-pointer transition-all"
                  style={{ background: "#0A0A0A", color: "#FAFAF8" }}
                >
                  {addingToCart ? "Ajout..." : addedToCart ? "Ajouté ✓" : canAddToCart && inStock ? "Ajouter au panier" : "Sélectionner une taille"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Sticky mobile CTA — appears when inline CTA scrolls out of view */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
              transform: showStickyMobileCta ? "translateY(0)" : "translateY(100%)",
              opacity: showStickyMobileCta ? 1 : 0,
              pointerEvents: showStickyMobileCta ? "auto" : "none",
            }}
          >
            <div
              className="border-t border-[#E3E1DC]/70"
              style={{
                background: "rgba(250,250,248,0.9)",
                backdropFilter: "blur(16px) saturate(170%)",
                WebkitBackdropFilter: "blur(16px) saturate(170%)",
                padding: "12px 14px calc(12px + env(safe-area-inset-bottom, 20px))",
              }}
            >
              <button
                onClick={canAddToCart && inStock ? handleAddToCart : () => setQuickSelectOpen(true)}
                aria-busy={addingToCart}
                className="w-full h-[52px] flex items-center justify-between px-5 text-[11px] font-medium uppercase tracking-[0.2em] border-none cursor-pointer"
                style={{ background: "#0A0A0A", color: "#FAFAF8" }}
              >
                <span>{addingToCart ? "Ajout..." : addedToCart ? "Ajouté ✓" : canAddToCart && inStock ? `Ajouter · ${selectedColor || ""}` : "Sélectionner une taille"}</span>
                {priceLabel && <span className="tracking-[0.04em]">{priceLabel}</span>}
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Quick Select Drawer */}
      {typeof document !== "undefined" && (
        <QuickSelectDrawer
          open={quickSelectOpen}
          onClose={() => setQuickSelectOpen(false)}
          product={product}
          onAddToCart={async (variantId) => {
            setAddingToCart(true); setAddError("")
            try {
              await addItem(variantId, 1)
              if (!isMounted.current) return
              setAddedToCart(true)
              if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
              addedTimerRef.current = setTimeout(() => { if (isMounted.current) { setAddedToCart(false); setQuickSelectOpen(false) } }, 1500)
            } catch (err) { if (isMounted.current) setAddError(err instanceof Error ? err.message : "Erreur") }
            finally { if (isMounted.current) setAddingToCart(false) }
          }}
          adding={addingToCart}
          added={addedToCart}
        />
      )}
    </div>
  )
}
