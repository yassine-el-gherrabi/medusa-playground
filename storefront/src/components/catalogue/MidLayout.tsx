"use client"

import Image from "next/image"
import Link from "next/link"
import ProductCard from "@/components/product/ProductCard"
import { getProductPrice, formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

type MidLayoutProps = {
  products: Product[]
  density: 3 | 4
}

export default function MidLayout({ products, density }: MidLayoutProps) {
  if (products.length === 0) return null

  const [featured, ...remaining] = products
  const featuredImage =
    featured.thumbnail || featured.images?.[0]?.url || ""
  const priceData = getProductPrice(featured)
  const priceLabel = priceData
    ? formatPrice(priceData.amount, priceData.currencyCode)
    : ""
  const categoryName = featured.categories?.[0]?.name
  const productUrl = `/products/${featured.handle}`

  const colsClass =
    density === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
  const gapClass =
    density === 3
      ? "gap-x-2 gap-y-5 lg:gap-x-14 lg:gap-y-6"
      : "gap-x-2 gap-y-5 lg:gap-x-10 lg:gap-y-4"

  return (
    <section aria-label="Produits" className="px-5 lg:px-8 py-7 lg:py-12">
      {/* Featured first product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-10 lg:mb-16">
        {/* Image */}
        <Link href={productUrl} className="block">
          <div className="relative aspect-[4/5] w-full bg-[var(--color-bg-subtle)] overflow-hidden">
            {featuredImage && (
              <Image
                src={featuredImage}
                alt={`${featured.title} — Ice Industry`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>
        </Link>

        {/* Text content */}
        <div className="lg:sticky lg:self-start lg:top-24">
          {categoryName && (
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
              {categoryName}
            </span>
          )}

          <h2 className="text-[28px] font-medium tracking-[-0.02em] mt-3">
            {featured.title}
          </h2>

          {priceLabel && (
            <p className="text-[17px] font-medium mt-4">{priceLabel}</p>
          )}

          {featured.description && (
            <p className="text-[14px] text-[var(--color-body)] leading-relaxed mt-4">
              {featured.description}
            </p>
          )}

          <Link
            href={productUrl}
            className="flex items-center justify-between w-full h-[52px] px-5 mt-8 bg-[var(--color-ink)] text-[var(--color-surface)] text-[11px] font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
          >
            <span>Voir le produit</span>
            <span>{priceLabel}</span>
          </Link>
        </div>
      </div>

      {/* Remaining products in standard grid */}
      {remaining.length > 0 && (
        <div className={`grid ${colsClass} ${gapClass}`}>
          {remaining.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
