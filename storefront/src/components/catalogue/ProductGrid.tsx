"use client"

import { useEffect, useRef, useState } from "react"
import ProductCard from "@/components/product/ProductCard"
import EditorialInsert from "@/components/catalogue/EditorialInsert"
import type { Product } from "@/types"

type ProductGridProps = {
  products: Product[]
  density: 3 | 4
  editorialInsert?: { kicker: string; headline: string }
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export default function ProductGrid({
  products,
  density,
  editorialInsert,
  loadingMore,
  hasMore,
  onLoadMore,
}: ProductGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [loadedCount, setLoadedCount] = useState(products.length)

  // Update announced count when products change
  useEffect(() => {
    if (products.length > loadedCount) {
      setLoadedCount(products.length)
    }
  }, [products.length, loadedCount])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || !onLoadMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin: "400px" }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

  // Build grid items with editorial insert after index 8
  const gridItems: React.ReactNode[] = []
  products.forEach((product, i) => {
    gridItems.push(<ProductCard key={product.id} product={product} />)
    if (i === 7 && editorialInsert) {
      gridItems.push(
        <EditorialInsert
          key="editorial-insert"
          kicker={editorialInsert.kicker}
          headline={editorialInsert.headline}
        />
      )
    }
  })

  const gapClass =
    density === 3
      ? "gap-x-2 gap-y-5 lg:gap-x-14 lg:gap-y-6"
      : "gap-x-2 gap-y-5 lg:gap-x-10 lg:gap-y-4"

  const colsClass =
    density === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"

  return (
    <section aria-label="Produits" className="px-5 lg:px-8 py-7 lg:py-12">
      <div className={`grid ${colsClass} ${gapClass}`}>{gridItems}</div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-10">
          {loadingMore && (
            <div className="h-5 w-5 border-2 border-[var(--color-border)] border-t-[var(--color-ink)] rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Accessible announcement for loaded products */}
      <div aria-live="polite" className="sr-only">
        {loadedCount} produits affichés
      </div>
    </section>
  )
}
