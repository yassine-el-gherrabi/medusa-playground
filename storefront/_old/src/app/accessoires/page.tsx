"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import ProductCard from "@/components/products/ProductCard"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"

export default function AccessoiresPage() {
  const { region } = useRegion()
  const [category, setCategory] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.category
      .list({ handle: "accessoires", fields: "*category_children" })
      .then(({ product_categories }) => {
        const cat = product_categories?.[0]
        if (cat) {
          setCategory(cat)
          setChildren(cat.category_children || [])
        }
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
        <div className="absolute inset-0 bg-gradient-to-b from-muted to-muted/80" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">Collection</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Accessoires</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Lunettes, casquettes, cache-cou. Les finitions qui font la difference.
          </p>
        </div>
      </section>

      {/* Sub-category links */}
      {children.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-wrap gap-4 justify-center">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.handle}`}
                className="px-6 py-3 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <ProductGridSkeleton count={8} />
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
