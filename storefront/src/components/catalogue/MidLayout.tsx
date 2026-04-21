"use client"

import Link from "next/link"
import ProductCard from "@/components/product/ProductCard"
import { getDensityClasses, type DensityLevel } from "@/hooks/useDensity"
import { getProductPrice, formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

type MidLayoutProps = {
  products: Product[]
  density: DensityLevel
}

export default function MidLayout({ products, density }: MidLayoutProps) {
  if (products.length === 0) return null

  const [featured, ...remaining] = products
  const priceData = getProductPrice(featured)
  const priceLabel = priceData
    ? formatPrice(priceData.amount, priceData.currencyCode)
    : ""
  const productUrl = `/products/${featured.handle}`

  const { cols: colsClass, gap: gapClass } = getDensityClasses(density)

  return (
    <section aria-label="Produits" className="px-3.5 lg:px-8 py-7 lg:py-12">
      {/* Featured first product — desktop only */}
      <div
        className="hidden lg:grid items-center mb-20"
        style={{ gridTemplateColumns: "2fr 3fr", gap: 48 }}
      >
        {/* Text side (left) */}
        <div>
          <span
            className="font-mono uppercase text-[var(--color-muted)]"
            style={{ fontSize: 11, letterSpacing: "0.22em" }}
          >
            Pièce signature
          </span>

          <h2
            className="font-medium mt-[18px]"
            style={{
              fontSize: 32,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
            }}
          >
            {featured.title}
          </h2>

          {priceLabel && (
            <p className="font-medium mt-3.5" style={{ fontSize: 17 }}>
              {priceLabel}
            </p>
          )}

          {featured.description && (
            <p
              className="max-w-[420px] text-[var(--color-body)] mt-5"
              style={{ fontSize: 15, lineHeight: 1.7 }}
            >
              {featured.description}
            </p>
          )}

          <Link
            href={productUrl}
            className="inline-block mt-7 bg-[var(--color-ink)] text-[var(--color-surface)] font-mono uppercase transition-opacity hover:opacity-90 cursor-pointer"
            style={{
              padding: "16px 24px",
              fontSize: 11,
              letterSpacing: "0.22em",
            }}
          >
            Voir la fiche produit ↗
          </Link>
        </div>

        {/* Image side (right) */}
        <ProductCard product={featured} showSwatches />
      </div>

      {/* Product grid — mobile shows ALL, desktop shows remaining */}
      <div className={`grid ${colsClass} ${gapClass}`}>
        {/* On mobile, include featured product; on desktop, skip it */}
        <div className="contents lg:hidden">
          <ProductCard product={featured} showSwatches />
        </div>
        {remaining.map((product) => (
          <ProductCard key={product.id} product={product} showSwatches />
        ))}
      </div>
    </section>
  )
}
