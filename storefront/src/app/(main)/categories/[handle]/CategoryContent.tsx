"use client"

import { useState, useEffect } from "react"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/RegionProvider"
import ProductCard from "@/components/product/ProductCard"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"
import type { Product, Category } from "@/types"

const LIMIT = 12

export default function CategoryContent({
  categoryId,
  children,
  initialProducts,
  initialCount,
}: {
  categoryId: string
  children: Category[]
  initialProducts: Product[]
  initialCount: number
}) {
  const { region } = useRegion()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [count, setCount] = useState(initialCount)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeChild, setActiveChild] = useState("")

  // Re-fetch when sub-category changes
  useEffect(() => {
    if (!region) return
    setLoading(true)
    setOffset(0)

    const id = activeChild
      ? children.find((c) => c.handle === activeChild)?.id || categoryId
      : categoryId

    sdk.store.product
      .list({
        limit: LIMIT,
        offset: 0,
        category_id: [id],
        fields: "*variants.calculated_price",
        region_id: region.id,
      })
      .then(({ products, count }) => {
        setProducts((products as Product[]) || [])
        setCount(count || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, activeChild])

  const loadMore = () => {
    if (!region) return
    const nextOffset = offset + LIMIT

    const id = activeChild
      ? children.find((c) => c.handle === activeChild)?.id || categoryId
      : categoryId

    sdk.store.product
      .list({
        limit: LIMIT,
        offset: nextOffset,
        category_id: [id],
        fields: "*variants.calculated_price",
        region_id: region.id,
      })
      .then(({ products: newProducts, count }) => {
        setProducts((prev) => [...prev, ...((newProducts as Product[]) || [])])
        setOffset(nextOffset)
        setCount(count || 0)
      })
      .catch(console.error)
  }

  const hasMore = offset + LIMIT < count

  return (
    <>
      {/* Sub-category tabs */}
      {children.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveChild("")}
              className={`px-5 py-2 text-sm rounded-full border transition-colors ${
                activeChild === ""
                  ? "bg-black text-white border-black"
                  : "border-border text-muted-foreground hover:border-black hover:text-foreground"
              }`}
            >
              Tout
            </button>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setActiveChild(child.handle)}
                className={`px-5 py-2 text-sm rounded-full border transition-colors ${
                  activeChild === child.handle
                    ? "bg-black text-white border-black"
                    : "border-border text-muted-foreground hover:border-black hover:text-foreground"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Aucun produit dans cette catégorie.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 border border-border text-sm font-medium uppercase tracking-wider hover:bg-muted transition-colors"
                >
                  Charger plus
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
