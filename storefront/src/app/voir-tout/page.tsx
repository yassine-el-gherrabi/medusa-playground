"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import ProductCard from "@/components/products/ProductCard"
import FilterBar from "@/components/catalogue/FilterBar"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"

export default function VoirToutPage() {
  const { region } = useRegion()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortOrder, setSortOrder] = useState("created_at")
  const limit = 12

  useEffect(() => {
    sdk.store.category
      .list({ parent_category_id: "null", limit: 10 })
      .then(({ product_categories }) => setCategories(product_categories || []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!region) return
    setLoading(true)
    setOffset(0)

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

    if (sortOrder === "title") params.order = "title"
    else if (sortOrder === "price_asc") params.order = "variants.calculated_price.calculated_amount"
    else params.order = "-created_at"

    sdk.store.product
      .list(params)
      .then(({ products, count }) => {
        setProducts(products || [])
        setHasMore((products?.length || 0) + 0 < (count || 0))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [region, selectedCategory, sortOrder, categories])

  const loadMore = () => {
    if (!region || !hasMore) return
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

    sdk.store.product
      .list(params)
      .then(({ products: newProducts, count }) => {
        setProducts((prev) => [...prev, ...(newProducts || [])])
        setOffset(nextOffset)
        setHasMore(nextOffset + limit < (count || 0))
      })
      .catch(console.error)
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 md:py-24 text-center px-4">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">Catalogue</p>
        <h1 className="text-3xl md:text-4xl font-bold">Voir Tout</h1>
      </section>

      {/* Filter + Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />

        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucun produit trouve.</p>
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
    </div>
  )
}
