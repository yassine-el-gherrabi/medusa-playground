"use client"

import { useEffect, useRef, useState } from "react"
import ProductCard from "@/components/product/ProductCard"
import EditorialInsert from "@/components/catalogue/EditorialInsert"
import { getDensityClasses, type DensityLevel } from "@/hooks/useDensity"
import type { Product } from "@/types"

type ProductGridProps = {
  products: Product[]
  density: DensityLevel
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

  useEffect(() => {
    if (products.length > loadedCount) setLoadedCount(products.length)
  }, [products.length, loadedCount])

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || !onLoadMore) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore() },
      { rootMargin: "400px" }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

  const gridItems: React.ReactNode[] = []
  products.forEach((product, i) => {
    gridItems.push(<ProductCard key={product.id} product={product} showSwatches />)
    if (i === 7 && editorialInsert) {
      gridItems.push(
        <EditorialInsert key="editorial-insert" kicker={editorialInsert.kicker} headline={editorialInsert.headline} />
      )
    }
  })

  const { cols, gap } = getDensityClasses(density)

  return (
    <section aria-label="Produits" className="px-5 lg:px-8 py-7 lg:py-12">
      <div className={`grid ${cols} ${gap}`}>{gridItems}</div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-10">
          {loadingMore && (
            <div className="h-5 w-5 border-2 border-[var(--color-border)] border-t-[var(--color-ink)] rounded-full animate-spin" />
          )}
        </div>
      )}

      <div aria-live="polite" className="sr-only">
        {loadedCount} produits affichés
      </div>
    </section>
  )
}
