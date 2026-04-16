"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import ProductImages from "@/components/product/ProductImages"
import ProductOptions from "@/components/product/ProductOptions"
import AddToCartButton from "@/components/product/AddToCartButton"
import { formatPrice, getProductPrice } from "@/lib/utils"
import { useCart } from "@/providers/CartProvider"
import { useRegion } from "@/providers/RegionProvider"
import { DEFAULT_REGION } from "@/lib/constants"
import { sdk } from "@/lib/sdk"
import type { Product } from "@/types"
import { useEffect } from "react"

// ── Accordion item ──

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left cursor-pointer"
      >
        <span className="text-[11px] uppercase tracking-[0.15em] font-medium">
          {title}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[500px] pb-5" : "max-h-0"
        }`}
      >
        <div className="text-[13px] text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Cross-sell card ──

function CrossSellCard({ product }: { product: Product }) {
  const priceData = getProductPrice(product)
  const thumbnail = product.thumbnail || product.images?.[0]?.url
  return (
    <Link href={`/products/${product.handle}`} className="shrink-0 w-[160px] group">
      <div className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden">
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="160px"
            loading="lazy"
          />
        )}
      </div>
      <div className="mt-2">
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

  // ── Option selection state ──
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

  // ── Find matching variant ──
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

  const onOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
  }

  // ── Cross-sell: related products ──
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  useEffect(() => {
    let cancelled = false
    const fetchRelated = async () => {
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
      } catch {
        // No related products module or no associations — that's fine
      }
    }
    fetchRelated()
    return () => { cancelled = true }
  }, [product.id, regionId])

  // ── Category label ──
  const categories = (product as unknown as Record<string, unknown>).categories as { name: string }[] | undefined
  const categoryLabel = categories?.[0]?.name

  return (
    <div className="animate-fade-in">
      {/* ── Layout: images left, info right on desktop ── */}
      <div className="lg:grid lg:grid-cols-2">
        {/* Images */}
        <ProductImages images={product.images || []} />

        {/* Product info — sticky on desktop */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="px-6 lg:px-12 pt-6 lg:pt-10 pb-32 lg:pb-16">
            {/* Category */}
            {categoryLabel && (
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
                {categoryLabel}
              </p>
            )}

            {/* Title */}
            <h1 className="text-[15px] lg:text-[17px] font-medium uppercase tracking-[0.08em]">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-2 mb-6">
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

            {/* Stock indicator */}
            {selectedVariant && (selectedVariant.inventory_quantity ?? 0) > 0 && (selectedVariant.inventory_quantity ?? 0) <= 3 && (
              <p className="text-[11px] text-red-600 mt-3">
                Plus que {selectedVariant.inventory_quantity} en stock
              </p>
            )}

            {/* Add to cart */}
            <div className="mt-6">
              <AddToCartButton variantId={selectedVariant?.id || null} />
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 mt-5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Livraison offerte dès 250€
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 010 8h-1" />
                </svg>
                Retours sous 14 jours
              </span>
            </div>

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

            {/* ── Accordion: Description, Livraison, Retours ── */}
            <div className="mt-6">
              {product.description && (
                <AccordionItem title="Description" defaultOpen>
                  <p>{product.description}</p>
                  {product.material && (
                    <p className="mt-2">Matière : {product.material}</p>
                  )}
                </AccordionItem>
              )}
              <AccordionItem title="Livraison">
                <p>Livraison standard : 3-5 jours ouvrés</p>
                <p className="mt-1">Livraison express : 1-2 jours ouvrés</p>
                <p className="mt-1">Livraison offerte à partir de 250 €</p>
              </AccordionItem>
              <AccordionItem title="Retours & Échanges">
                <p>Vous disposez de 14 jours après réception pour retourner vos articles.</p>
                <p className="mt-1">Les articles doivent être retournés dans leur état d&apos;origine, non portés, avec les étiquettes.</p>
                <p className="mt-1">Les retours sont gratuits en France métropolitaine.</p>
              </AccordionItem>
              <div className="border-t border-border" /> {/* closing border */}
            </div>

            {/* ── Cross-sell: "Complétez le look" ── */}
            {relatedProducts.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] mb-4">
                  Complétez le look
                </h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                  {relatedProducts.map((p) => (
                    <CrossSellCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky mobile CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-6 py-4">
        <button
          onClick={async () => {
            if (!selectedVariant?.id) return
            await addItem(selectedVariant.id, 1)
          }}
          disabled={!selectedVariant?.id}
          className={`w-full h-[48px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all ${
            !selectedVariant?.id
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-foreground text-background cursor-pointer"
          }`}
        >
          {!selectedVariant?.id
            ? "Sélectionnez vos options"
            : price
              ? `Ajouter au panier — ${formatPrice(price.calculated_amount!, price.currency_code!)}`
              : "Ajouter au panier"}
        </button>
      </div>
    </div>
  )
}
