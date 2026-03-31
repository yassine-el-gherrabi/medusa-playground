"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/RegionProvider"
import ProductCard from "@/components/product/ProductCard"
import FilterBar from "@/components/catalogue/FilterBar"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"
import type { Product, Category, Collection } from "@/types"

const LIMIT = 12

export default function BoutiqueContent({
  initialProducts,
  initialCount,
  categories,
  collections,
}: {
  initialProducts: Product[]
  initialCount: number
  categories: Category[]
  collections: Collection[]
}) {
  const { region } = useRegion()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(initialProducts.length < initialCount)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCollection, setSelectedCollection] = useState(
    searchParams.get("collection") || ""
  )
  const [sortOrder, setSortOrder] = useState("created_at")
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Re-fetch when filters change
  useEffect(() => {
    if (!region) return
    setLoading(true)
    setOffset(0)
    setHasMore(true)

    const params: Record<string, unknown> = {
      limit: LIMIT,
      offset: 0,
      region_id: region.id,
      fields: "*variants.calculated_price",
    }

    if (selectedCategory) {
      const cat = categories.find((c) => c.handle === selectedCategory)
      if (cat) params.category_id = [cat.id]
    }

    if (selectedCollection) {
      const col = collections.find((c) => c.handle === selectedCollection)
      if (col) params.collection_id = [col.id]
    }

    if (sortOrder === "title") params.order = "title"
    else if (sortOrder === "price_asc")
      params.order = "variants.calculated_price.calculated_amount"
    else params.order = "-created_at"

    sdk.store.product
      .list(params)
      .then(({ products, count }) => {
        setProducts((products as Product[]) || [])
        setHasMore((products?.length || 0) < (count || 0))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, selectedCategory, selectedCollection, sortOrder])

  // Load more
  const loadMore = useCallback(() => {
    if (!region || !hasMore || loadingMore) return
    setLoadingMore(true)
    const nextOffset = offset + LIMIT

    const params: Record<string, unknown> = {
      limit: LIMIT,
      offset: nextOffset,
      region_id: region.id,
      fields: "*variants.calculated_price",
    }

    if (selectedCategory) {
      const cat = categories.find((c) => c.handle === selectedCategory)
      if (cat) params.category_id = [cat.id]
    }

    if (selectedCollection) {
      const col = collections.find((c) => c.handle === selectedCollection)
      if (col) params.collection_id = [col.id]
    }

    sdk.store.product
      .list(params)
      .then(({ products: newProducts, count }) => {
        setProducts((prev) => [...prev, ...((newProducts as Product[]) || [])])
        setOffset(nextOffset)
        setHasMore(nextOffset + LIMIT < (count || 0))
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false))
  }, [
    region,
    hasMore,
    loadingMore,
    offset,
    selectedCategory,
    selectedCollection,
    categories,
    collections,
  ])

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: "200px" }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

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
