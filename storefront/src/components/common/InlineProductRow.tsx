"use client"

import ProductCard from "@/components/product/ProductCard"
import type { Product } from "@/types"

export default function InlineProductRow({
  products,
}: {
  products: Product[]
}) {
  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
