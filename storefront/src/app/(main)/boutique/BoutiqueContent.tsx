"use client"

import { useEffect, useRef } from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRegion } from "@/providers/RegionProvider"
import { useProductList } from "@/hooks/useProductList"
import ProductCard from "@/components/product/ProductCard"
import FilterBar from "@/components/catalogue/FilterBar"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"
import type { Category, Collection } from "@/types"

const LIMIT = 12

export default function BoutiqueContent({
  initialProducts,
  initialCount,
  categories,
  collections,
}: {
  initialProducts: import("@/types").Product[]
  initialCount: number
  categories: Category[]
  collections: Collection[]
}) {
  const { region } = useRegion()
  const searchParams = useSearchParams()

  const { products, loading, loadingMore, hasMore, error, fetchProducts, loadMore } =
    useProductList({ products: initialProducts, count: initialCount })

  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCollection, setSelectedCollection] = useState(
    searchParams.get("collection") || ""
  )
  const [sortOrder, setSortOrder] = useState("created_at")
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Build sort order string
  const getOrder = () => {
    if (sortOrder === "title") return "title"
    if (sortOrder === "price_asc")
      return "variants.calculated_price.calculated_amount"
    return "-created_at"
  }

  // Build filter IDs
  const getCategoryId = () => {
    if (!selectedCategory) return undefined
    const cat = categories.find((c) => c.handle === selectedCategory)
    return cat ? [cat.id] : undefined
  }

  const getCollectionId = () => {
    if (!selectedCollection) return undefined
    const col = collections.find((c) => c.handle === selectedCollection)
    return col ? [col.id] : undefined
  }

  // Re-fetch when filters change
  useEffect(() => {
    if (!region) return
    fetchProducts({
      regionId: region.id,
      limit: LIMIT,
      categoryId: getCategoryId(),
      collectionId: getCollectionId(),
      order: getOrder(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-fetch only on filter/sort change, not on helper fn refs
  }, [region, selectedCategory, selectedCollection, sortOrder])

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && region) {
          loadMore({
            regionId: region.id,
            limit: LIMIT,
            categoryId: getCategoryId(),
            collectionId: getCollectionId(),
            order: getOrder(),
          })
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-fetch only on filter/sort change, not on helper fn refs
  }, [hasMore, loading, region])

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <FilterBar
        categories={categories}
        collections={collections}
        selectedCategory={selectedCategory}
        selectedCollection={selectedCollection}
        onCategoryChange={setSelectedCategory}
        onCollectionChange={setSelectedCollection}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Aucun produit trouvé.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-12">
              {loadingMore && (
                <div className="h-6 w-6 border-2 border-border border-t-foreground rounded-full animate-spin" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
