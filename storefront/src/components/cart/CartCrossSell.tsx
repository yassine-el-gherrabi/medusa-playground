"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/RegionProvider"
import { DEFAULT_REGION } from "@/lib/constants"
import { PRODUCT_FIELDS } from "@/lib/medusa/products"
import ProductCard from "@/components/product/ProductCard"
import type { Product, LineItem } from "@/types"

const MAX_COUNT = 8

async function fetchRelatedIds(productId: string): Promise<string[]> {
  try {
    const res = await sdk.client.fetch<{ related_product_ids: string[] }>(
      `/store/products/${productId}/related`, { method: "GET" }
    )
    return res.related_product_ids || []
  } catch { return [] }
}

/**
 * 4-level cascade recommendation algorithm for cart cross-sell:
 * 1. Manual associations (Related Products module) for ALL cart items
 * 2. Same collection as cart items, DIFFERENT category
 * 3. Same category as cart items
 * 4. Recent products (fallback)
 */
async function getRecommendations(cartItems: LineItem[], regionId: string): Promise<Product[]> {
  const inCartProductIds = new Set(
    cartItems.map((item) => (item as unknown as Record<string, string>).product_id).filter(Boolean)
  )
  const results: Product[] = []
  const seenIds = new Set<string>()
  const region = regionId || DEFAULT_REGION

  const addIfNew = (products: Product[]) => {
    for (const p of products) {
      if (results.length >= MAX_COUNT) break
      if (!seenIds.has(p.id) && !inCartProductIds.has(p.id)) {
        const hasStock = p.variants?.some((v) => (v.inventory_quantity ?? 1) > 0)
        if (hasStock !== false) { seenIds.add(p.id); results.push(p) }
      }
    }
  }

  // 1. Manual associations for ALL cart items
  for (const item of cartItems) {
    if (results.length >= MAX_COUNT) break
    const productId = (item as unknown as Record<string, string>).product_id
    if (!productId) continue
    const relatedIds = await fetchRelatedIds(productId)
    if (relatedIds.length > 0) {
      try {
        const { products } = await sdk.store.product.list({
          id: relatedIds, ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: relatedIds.length,
        })
        addIfNew((products as Product[]) || [])
      } catch {}
    }
  }

  // Fetch cart product details for collection/category info
  const cartProductIds = [...inCartProductIds]
  let cartCollectionIds = new Set<string>()
  let cartCategoryIds = new Set<string>()

  if (results.length < MAX_COUNT && cartProductIds.length > 0) {
    try {
      const { products } = await sdk.store.product.list({
        id: cartProductIds, ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: cartProductIds.length,
      })
      for (const p of products as Product[]) {
        const collId = (p as unknown as Record<string, unknown>).collection_id as string | undefined
        if (collId) cartCollectionIds.add(collId)
        const cats = (p as unknown as Record<string, unknown>).categories as { id: string }[] | undefined
        cats?.forEach((c) => cartCategoryIds.add(c.id))
      }
    } catch {}
  }

  // 2. Same collection, DIFFERENT category
  if (results.length < MAX_COUNT) {
    for (const collId of cartCollectionIds) {
      if (results.length >= MAX_COUNT) break
      try {
        const { products } = await sdk.store.product.list({
          collection_id: [collId], ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 12, order: "-created_at",
        })
        const filtered = (products as Product[]).filter((p) => {
          const pCats = ((p as unknown as Record<string, unknown>).categories as { id: string }[] | undefined) || []
          return !pCats.some((c) => cartCategoryIds.has(c.id))
        })
        addIfNew(filtered)
      } catch {}
    }
  }

  // 3. Same category
  if (results.length < MAX_COUNT) {
    for (const catId of cartCategoryIds) {
      if (results.length >= MAX_COUNT) break
      try {
        const { products } = await sdk.store.product.list({
          category_id: [catId], ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 12, order: "-created_at",
        })
        addIfNew(products as Product[])
      } catch {}
    }
  }

  // 4. Recent products fallback
  if (results.length < MAX_COUNT) {
    try {
      const { products } = await sdk.store.product.list({
        ...(region && { region_id: region }), fields: PRODUCT_FIELDS, limit: 16, order: "-created_at",
      })
      addIfNew(products as Product[])
    } catch {}
  }

  return results.slice(0, MAX_COUNT)
}

export default function CartCrossSell({ cartItems }: { cartItems: LineItem[] }) {
  const { regionId } = useRegion()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Stabilize: only re-fetch when product IDs in cart change
  const cartProductIds = cartItems
    .map((item) => (item as unknown as Record<string, string>).product_id)
    .filter(Boolean).sort().join(",")

  useEffect(() => {
    if (!cartProductIds) { setProducts([]); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    getRecommendations(cartItems, regionId || DEFAULT_REGION)
      .then((recs) => { if (!cancelled) { setProducts(recs); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartProductIds, regionId])

  if (loading || products.length === 0) return null

  return (
    <div className="mt-5 pt-5 border-t border-border">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] mb-3">Complétez le look</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: "none" }}>
        {products.map((product) => (
          <div key={product.id} className="shrink-0 w-[160px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
