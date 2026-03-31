"use client"

import { useState, useEffect, useMemo } from "react"
import { useRegion } from "@/providers/RegionProvider"
import { useProductList } from "@/hooks/useProductList"
import ProductCard from "@/components/product/ProductCard"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"
import type { Category } from "@/types"

const LIMIT = 12

export default function CategoryContent({
  categoryId,
  subcategories,
  initialProducts,
  initialCount,
}: {
  categoryId: string
  subcategories: Category[]
  initialProducts: import("@/types").Product[]
  initialCount: number
}) {
  const { region } = useRegion()
  const { products, loading, hasMore, error, fetchProducts, loadMore } =
    useProductList({ products: initialProducts, count: initialCount })

  const [activeChild, setActiveChild] = useState("")

  // Memoize child handle → id map for O(1) lookup
  const childIdMap = useMemo(
    () => new Map(subcategories.map((c) => [c.handle, c.id])),
    [subcategories]
  )

  const getActiveCategoryId = () =>
    activeChild ? childIdMap.get(activeChild) || categoryId : categoryId

  // Re-fetch when sub-category changes
  useEffect(() => {
    if (!region) return
    fetchProducts({
      regionId: region.id,
      limit: LIMIT,
      categoryId: [getActiveCategoryId()],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, activeChild])

  const handleLoadMore = () => {
    if (!region) return
    loadMore({
      regionId: region.id,
      limit: LIMIT,
      categoryId: [getActiveCategoryId()],
    })
  }

  return (
    <>
      {/* Sub-category tabs */}
      {subcategories.length > 0 && (
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
            {subcategories.map((child) => (
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-6">
            {error}
          </div>
        )}

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
                  onClick={handleLoadMore}
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
