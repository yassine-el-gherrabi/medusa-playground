"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import ProductCard from "@/components/products/ProductCard"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"

export default function IceForGirlsPage() {
  const { region } = useRegion()
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.category
      .list({ handle: "ice-for-girls" })
      .then(({ product_categories }) => {
        if (product_categories?.[0]) setCategory(product_categories[0])
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!category?.id || !region) return

    sdk.store.product
      .list({
        category_id: [category.id],
        region_id: region.id,
        fields: "*variants.calculated_price",
        limit: 20,
      })
      .then(({ products }) => setProducts(products || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category, region])

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-24 md:py-32 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted to-black" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">Exclusive</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Ice for Girls</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Une ligne dediee. Des coupes feminines, le meme ADN streetwear Ice Industry.
          </p>
        </div>
      </section>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 pb-20 pt-8">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Bientot disponible.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
