"use client"

import { Suspense, useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import ProductCard from "@/components/products/ProductCard"
import FilterBar from "@/components/catalogue/FilterBar"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"
import EditorialHero from "@/components/collections/EditorialHero"

type Collection = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any>
  created_at?: string
}

export default function VoirToutPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-fade-in">
          <section className="relative h-[70vh] md:h-[80vh] bg-black" />
          <div className="max-w-7xl mx-auto px-4 pb-20">
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      }
    >
      <VoirToutContent />
    </Suspense>
  )
}

function VoirToutContent() {
  const { region } = useRegion()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCollection, setSelectedCollection] = useState(
    searchParams.get("collection") || ""
  )
  const [sortOrder, setSortOrder] = useState("created_at")
  const limit = 12

  const sentinelRef = useRef<HTMLDivElement>(null)

  // Fetch categories + collections on mount
  useEffect(() => {
    sdk.store.category
      .list({ parent_category_id: "null", limit: 10 })
      .then(({ product_categories }) => setCategories(product_categories || []))
      .catch(console.error)

    sdk.store.collection
      .list({ fields: "id,title,handle,metadata,created_at" })
      .then(({ collections }) => setCollections((collections as Collection[]) || []))
      .catch(console.error)
  }, [])

  // Fetch products when filters/sort/region change
  useEffect(() => {
    if (!region) return
    setLoading(true)
    setOffset(0)
    setHasMore(true)

    const params: any = {
      limit,
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
    else if (sortOrder === "price_asc") params.order = "variants.calculated_price.calculated_amount"
    else params.order = "-created_at"

    sdk.store.product
      .list(params)
      .then(({ products, count }) => {
        setProducts(products || [])
        setHasMore((products?.length || 0) < (count || 0))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [region, selectedCategory, selectedCollection, sortOrder, categories, collections])

  // Load more products
  const loadMore = useCallback(() => {
    if (!region || !hasMore || loadingMore) return
    setLoadingMore(true)
    const nextOffset = offset + limit

    const params: any = {
      limit,
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

    if (sortOrder === "title") params.order = "title"
    else if (sortOrder === "price_asc") params.order = "variants.calculated_price.calculated_amount"
    else params.order = "-created_at"

    sdk.store.product
      .list(params)
      .then(({ products: newProducts, count }) => {
        setProducts((prev) => [...prev, ...(newProducts || [])])
        setOffset(nextOffset)
        setHasMore(nextOffset + limit < (count || 0))
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false))
  }, [region, hasMore, loadingMore, offset, selectedCategory, selectedCollection, sortOrder, categories, collections])

  // IntersectionObserver for infinite scroll
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

  // Handle filter changes — reset offset
  const handleCategoryChange = (handle: string) => {
    setSelectedCategory(handle)
    setOffset(0)
  }

  const handleCollectionChange = (handle: string) => {
    setSelectedCollection(handle)
    setOffset(0)
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <EditorialHero title="Boutique" label="Catalogue" imageUrl="/images/hero-ice2.webp" />

      {/* Filter + Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <FilterBar
          categories={categories}
          collections={collections}
          selectedCategory={selectedCategory}
          selectedCollection={selectedCollection}
          onCategoryChange={handleCategoryChange}
          onCollectionChange={handleCollectionChange}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucun produit trouvé.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
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
    </div>
  )
}
