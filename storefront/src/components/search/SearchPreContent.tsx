"use client"

import Link from "next/link"
import Image from "next/image"
import { formatPrice, getProductPrice } from "@/lib/utils"
import type { Category, Product } from "@/types"

export default function SearchPreContent({
  categories,
  trendingProducts,
  loadingTrending,
  onClose,
}: {
  categories: Category[]
  trendingProducts: Product[]
  loadingTrending: boolean
  onClose: () => void
}) {
  // Flatten categories for display as pills
  const allCategories: { name: string; handle: string }[] = []
  for (const cat of categories) {
    allCategories.push({ name: cat.name, handle: cat.handle })
    if (cat.category_children) {
      for (const child of cat.category_children) {
        allCategories.push({ name: child.name, handle: child.handle })
      }
    }
  }

  return (
    <div className="space-y-10">
      {/* Category pills */}
      {allCategories.length > 0 && (
        <div>
          <h3 className="text-[11px] font-normal tracking-[0.15em] uppercase text-muted-foreground mb-4">
            Catégories
          </h3>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <Link
                key={cat.handle}
                href={`/categories/${cat.handle}`}
                onClick={onClose}
                className="px-4 py-2 border border-border text-xs tracking-wide uppercase hover:bg-foreground hover:text-background transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending products */}
      <div>
        <h3 className="text-[11px] font-normal tracking-[0.15em] uppercase text-muted-foreground mb-4">
          Tendances
        </h3>
        {loadingTrending ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="mt-2 h-3 bg-muted w-3/4" />
                <div className="mt-1 h-3 bg-muted w-1/2" />
              </div>
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {trendingProducts.slice(0, 8).map((product) => {
              const priceData = getProductPrice(product)
              const thumbnail = product.thumbnail || product.images?.[0]?.url

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.handle}`}
                  onClick={onClose}
                  className="group"
                >
                  <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                    {thumbnail && (
                      <Image
                        src={thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-xs truncate">{product.title}</p>
                  {priceData && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(priceData.amount, priceData.currencyCode)}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
