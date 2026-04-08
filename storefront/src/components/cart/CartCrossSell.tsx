"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { sdk } from "@/lib/sdk"
import { useCart } from "@/providers/CartProvider"
import { useRegion } from "@/providers/RegionProvider"
import { formatPrice, getProductPrice } from "@/lib/utils"
import { DEFAULT_REGION } from "@/lib/constants"
import type { Product, LineItem } from "@/types"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const TARGET_COUNT = 3

async function fetchRelatedIds(productId: string): Promise<string[]> {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/products/${productId}/related`, {
      headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.related_product_ids || []
  } catch { return [] }
}

async function fetchProductsByIds(ids: string[], regionId: string): Promise<Product[]> {
  if (ids.length === 0) return []
  try {
    const { products } = await sdk.store.product.list({
      id: ids, region_id: regionId,
      fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,*options.values",
      limit: ids.length,
    })
    return (products as Product[]) || []
  } catch { return [] }
}

async function getRecommendations(cartItems: LineItem[], regionId: string): Promise<Product[]> {
  const inCartProductIds = new Set(
    cartItems.map((item) => (item as unknown as Record<string, string>).product_id).filter(Boolean)
  )
  const results: Product[] = []
  const seenIds = new Set<string>()

  const addIfNew = (products: Product[]) => {
    for (const p of products) {
      if (results.length >= TARGET_COUNT) break
      if (!seenIds.has(p.id) && !inCartProductIds.has(p.id)) {
        const hasStock = p.variants?.some((v) => (v.inventory_quantity ?? 1) > 0)
        if (hasStock !== false) { seenIds.add(p.id); results.push(p) }
      }
    }
  }

  const firstItem = cartItems[0]
  if (firstItem) {
    const productId = (firstItem as unknown as Record<string, string>).product_id
    if (productId) {
      const relatedIds = await fetchRelatedIds(productId)
      if (relatedIds.length > 0) addIfNew(await fetchProductsByIds(relatedIds, regionId))
    }
  }

  if (results.length < TARGET_COUNT) {
    try {
      const { products } = await sdk.store.product.list({
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,*options.values",
        limit: 10, order: "-created_at",
      })
      addIfNew((products as Product[]) || [])
    } catch { /* */ }
  }

  return results.slice(0, TARGET_COUNT)
}

// ── Extract sizes from product ──
function extractSizes(product: Product): { value: string; label: string; inStock: boolean; variantId: string }[] {
  const sizeOpt = product.options?.find((o) =>
    ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || "")
  )
  if (!sizeOpt?.values?.length) return []

  // Get first color for variant matching
  const colorOpt = product.options?.find((o) =>
    ["color", "couleur"].includes(o.title?.toLowerCase() || "")
  )
  const firstColor = colorOpt?.values?.[0]?.value || ""

  return sizeOpt.values.map((sv) => {
    // Find matching variant (first color + this size)
    const variant = product.variants?.find((v) => {
      const opts: Record<string, string> = {}
      v.options?.forEach((o) => { opts[o.option?.title?.toLowerCase() || ""] = o.value })
      const sizeMatch = (opts["size"] || opts["taille"] || opts["pointure"] || "") === sv.value
      const colorMatch = !firstColor || (opts["color"] || opts["couleur"] || "") === firstColor
      return sizeMatch && colorMatch
    })
    return {
      value: sv.value,
      label: sv.value,
      inStock: (variant?.inventory_quantity ?? 1) > 0,
      variantId: variant?.id || "",
    }
  })
}

// ── Cross-sell card with inline size picker ──
function CrossSellCard({
  product, onAdd, isAdding,
}: {
  product: Product; onAdd: (variantId: string) => void; isAdding: boolean
}) {
  const [sizesOpen, setSizesOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const priceData = getProductPrice(product)
  const thumbnail = product.thumbnail || product.images?.[0]?.url
  const sizes = extractSizes(product)
  const hasSizes = sizes.length > 0

  const handleAdd = () => {
    if (!hasSizes) {
      // No sizes (accessory) → add first variant directly
      const variantId = product.variants?.[0]?.id
      if (variantId) onAdd(variantId)
      return
    }
    if (!sizesOpen) { setSizesOpen(true); return }
    if (!selectedSize) return
    const size = sizes.find((s) => s.value === selectedSize)
    if (size?.variantId) onAdd(size.variantId)
    setSizesOpen(false)
    setSelectedSize(null)
  }

  const buttonLabel = isAdding
    ? "Ajout..."
    : sizesOpen && !selectedSize
      ? "Taille ?"
      : "+ Ajouter"

  return (
    <div className="shrink-0 w-[140px]">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden">
          {thumbnail && (
            <Image src={thumbnail} alt={product.title} fill className="object-cover" sizes="140px" loading="lazy" />
          )}
        </div>
      </Link>

      <div className="mt-2">
        <p className="text-[11px] leading-tight line-clamp-1">{product.title}</p>
        {priceData && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatPrice(priceData.amount, priceData.currencyCode)}
          </p>
        )}

        {/* Size selector — appears on click */}
        {sizesOpen && hasSizes && (
          <div className="flex flex-wrap gap-1.5 mt-1.5 animate-fade-in">
            {sizes.map((s) => (
              <button
                key={s.value}
                onClick={() => s.inStock && setSelectedSize(s.value)}
                disabled={!s.inStock}
                className={`text-[10px] transition-colors cursor-pointer ${
                  selectedSize === s.value
                    ? "text-foreground font-medium underline underline-offset-2"
                    : s.inStock
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-black/20 line-through cursor-not-allowed"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={isAdding || (sizesOpen && !selectedSize)}
          className={`text-[10px] uppercase tracking-[0.1em] transition-colors mt-1.5 ${
            isAdding || (sizesOpen && !selectedSize)
              ? "text-black/30 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground cursor-pointer"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

// ── Main component ──
export default function CartCrossSell({ cartItems }: { cartItems: LineItem[] }) {
  const { addItem } = useCart()
  const { regionId } = useRegion()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    if (cartItems.length === 0) { setProducts([]); setLoading(false); return }
    let cancelled = false
    const run = async () => {
      setLoading(true)
      const recs = await getRecommendations(cartItems, regionId || DEFAULT_REGION)
      if (!cancelled) { setProducts(recs); setLoading(false) }
    }
    run()
    return () => { cancelled = true }
  }, [cartItems, regionId])

  const handleAdd = async (productId: string, variantId: string) => {
    setAddingId(productId)
    try { await addItem(variantId, 1) } catch { /* */ }
    finally { setAddingId(null) }
  }

  if (loading || products.length === 0) return null

  return (
    <div className="mt-5 pt-5 border-t border-border">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] mb-3">Complétez le look</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: "none" }}>
        {products.map((product) => (
          <CrossSellCard
            key={product.id}
            product={product}
            onAdd={(variantId) => handleAdd(product.id, variantId)}
            isAdding={addingId === product.id}
          />
        ))}
      </div>
    </div>
  )
}
