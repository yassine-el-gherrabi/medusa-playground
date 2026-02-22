"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import ProductCard from "@/components/products/ProductCard"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"

export default function CategoryPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = use(params)
  const { region } = useRegion()
  const [category, setCategory] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeChild, setActiveChild] = useState("")
  const limit = 12

  useEffect(() => {
    sdk.store.category
      .list({ handle, fields: "*category_children" })
      .then(({ product_categories }) => {
        const cat = product_categories?.[0]
        if (cat) {
          setCategory(cat)
          setChildren(cat.category_children || [])
        }
      })
      .catch(console.error)
  }, [handle])

  useEffect(() => {
    if (!category?.id || !region) return
    setLoading(true)
    setOffset(0)

    const categoryId = activeChild
      ? children.find((c) => c.handle === activeChild)?.id || category.id
      : category.id

    sdk.store.product
      .list({
        limit,
        offset: 0,
        category_id: [categoryId],
        fields: "*variants.calculated_price",
        region_id: region.id,
      })
      .then(({ products, count }) => {
        setProducts(products || [])
        setCount(count || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category, region, activeChild, children])

  const loadMore = () => {
    if (!category?.id || !region) return
    const nextOffset = offset + limit

    const categoryId = activeChild
      ? children.find((c) => c.handle === activeChild)?.id || category.id
      : category.id

    sdk.store.product
      .list({
        limit,
        offset: nextOffset,
        category_id: [categoryId],
        fields: "*variants.calculated_price",
        region_id: region.id,
      })
      .then(({ products: newProducts, count }) => {
        setProducts((prev) => [...prev, ...(newProducts || [])])
        setOffset(nextOffset)
        setCount(count || 0)
      })
      .catch(console.error)
  }

  const hasMore = offset + limit < count

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-24 md:py-32 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted to-muted/80" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">
            Collection
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {category?.name || "Categorie"}
          </h1>
        </div>
      </section>

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
                    ? "bg-white text-black border-white"
                    : "border-border text-muted-foreground hover:border-white hover:text-white"
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
            Aucun produit dans cette categorie.
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
    </div>
  )
}
