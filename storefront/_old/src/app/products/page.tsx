"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import ProductGrid from "@/components/products/ProductGrid"

export default function ProductsPage() {
  const { region } = useRegion()
  const [products, setProducts] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const limit = 12

  useEffect(() => {
    if (!region) return
    setLoading(true)
    sdk.store.product
      .list({
        limit,
        offset,
        fields: "*variants.calculated_price",
        region_id: region.id,
      })
      .then(({ products, count }) => {
        setProducts((prev) => (offset === 0 ? products : [...prev, ...products]))
        setCount(count)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [offset, region])

  const hasMore = offset + limit < count

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <ProductGrid products={products} />
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      )}
      {hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={() => setOffset((prev) => prev + limit)}
            className="px-6 py-3 border border-black rounded-md text-sm font-medium hover:bg-black hover:text-white transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
