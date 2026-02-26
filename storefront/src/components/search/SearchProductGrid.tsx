"use client"

import Link from "next/link"
import Image from "next/image"
import { formatPrice, getProductPrice } from "@/lib/utils"

export default function SearchProductGrid({
  products,
  query,
  total,
  loading,
  onClose,
}: {
  products: any[]
  query: string
  total: number
  loading: boolean
  onClose: () => void
}) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-normal tracking-[0.15em] uppercase text-muted-foreground">
            Produits
          </h3>
          <div className="h-3 w-20 bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted" />
              <div className="mt-2 h-3 bg-muted w-3/4" />
              <div className="mt-1 h-3 bg-muted w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0 && query.trim()) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Aucun résultat pour &ldquo;{query}&rdquo;
      </p>
    )
  }

  if (products.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-normal tracking-[0.15em] uppercase text-muted-foreground">
          Produits
        </h3>
        {total > 0 && (
          <span className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground">
            {total} résultat{total > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product: any) => {
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

      {/* See all results */}
      {total > products.length && (
        <div className="mt-6 text-center">
          <Link
            href={`/boutique?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="inline-block text-[11px] font-normal tracking-[0.15em] uppercase border-b border-current pb-0.5 hover:opacity-70 transition-opacity"
          >
            Voir tous les résultats ({total})
          </Link>
        </div>
      )}
    </div>
  )
}
