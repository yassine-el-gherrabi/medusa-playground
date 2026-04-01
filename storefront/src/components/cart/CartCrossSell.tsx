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

/**
 * Fetch related product IDs from the Related Products module API
 */
async function fetchRelatedIds(productId: string): Promise<string[]> {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/products/${productId}/related`, {
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.related_product_ids || []
  } catch {
    return []
  }
}

/**
 * Fetch products by IDs
 */
async function fetchProductsByIds(ids: string[], regionId: string): Promise<Product[]> {
  if (ids.length === 0) return []
  try {
    const { products } = await sdk.store.product.list({
      id: ids,
      region_id: regionId,
      fields: "*variants.calculated_price,+metadata",
      limit: ids.length,
    })
    return (products as Product[]) || []
  } catch {
    return []
  }
}

/**
 * Cascade recommendation logic:
 * 1. Related products (from module)
 * 2. Same collection
 * 3. Newest products
 */
async function getRecommendations(
  cartItems: LineItem[],
  regionId: string
): Promise<Product[]> {
  const inCartProductIds = new Set(
    cartItems.map((item) => (item as unknown as Record<string, string>).product_id).filter(Boolean)
  )
  const results: Product[] = []
  const seenIds = new Set<string>()

  const addIfNew = (products: Product[]) => {
    for (const p of products) {
      if (results.length >= TARGET_COUNT) break
      if (!seenIds.has(p.id) && !inCartProductIds.has(p.id)) {
        // Filter out sold-out products
        const hasStock = p.variants?.some((v) => (v.inventory_quantity ?? 1) > 0)
        if (hasStock !== false) {
          seenIds.add(p.id)
          results.push(p)
        }
      }
    }
  }

  // 1. Related products from module (first item in cart)
  const firstItem = cartItems[0]
  if (firstItem) {
    const productId = (firstItem as unknown as Record<string, string>).product_id
    if (productId) {
      const relatedIds = await fetchRelatedIds(productId)
      if (relatedIds.length > 0) {
        const relatedProducts = await fetchProductsByIds(relatedIds, regionId)
        addIfNew(relatedProducts)
      }
    }
  }

  // 2. Fallback: fetch more products (newest) if not enough
  if (results.length < TARGET_COUNT) {
    try {
      const { products } = await sdk.store.product.list({
        region_id: regionId,
        fields: "*variants.calculated_price,+metadata",
        limit: 10,
        order: "-created_at",
      })
      addIfNew((products as Product[]) || [])
    } catch { /* fallback failed */ }
  }

  return results.slice(0, TARGET_COUNT)
}

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

  const handleQuickAdd = async (product: Product) => {
    const variant = product.variants?.[0]
    if (!variant) return
    setAddingId(product.id)
    try { await addItem(variant.id, 1) } catch { /* */ }
    finally { setAddingId(null) }
  }

  if (loading || products.length === 0) return null

  return (
    <div className="mt-5 pt-5 border-t border-border">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] mb-3">
        Complétez le look
      </h3>

      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => {
          const priceData = getProductPrice(product)
          const thumbnail = product.thumbnail || product.images?.[0]?.url
          const isAdding = addingId === product.id

          return (
            <div key={product.id} className="shrink-0 w-[120px]">
              {/* Image */}
              <Link href={`/products/${product.handle}`} className="block">
                <div className="aspect-[3/4] relative bg-[#f5f5f5] overflow-hidden">
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="120px"
                      loading="lazy"
                    />
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="mt-2">
                <p className="text-[10px] leading-tight line-clamp-1">{product.title}</p>
                {priceData && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatPrice(priceData.amount, priceData.currencyCode)}
                  </p>
                )}

                {/* Quick add */}
                <button
                  onClick={() => handleQuickAdd(product)}
                  disabled={isAdding}
                  className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors mt-1 cursor-pointer disabled:opacity-50"
                >
                  {isAdding ? "Ajout..." : "+ Ajouter"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
