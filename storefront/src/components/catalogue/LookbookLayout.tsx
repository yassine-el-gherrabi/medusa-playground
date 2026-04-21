"use client"

import Link from "next/link"
import ProductCard from "@/components/product/ProductCard"
import { getProductPrice, formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

type LookbookLayoutProps = {
  products: Product[]
}

export default function LookbookLayout({ products }: LookbookLayoutProps) {
  if (products.length === 0) return null

  return (
    <section aria-label="Produits" className="py-9 lg:py-20">
      {products.map((product, index) => {
        const priceData = getProductPrice(product)
        const priceLabel = priceData
          ? formatPrice(priceData.amount, priceData.currencyCode)
          : ""
        const categoryName = product.categories?.[0]?.name
        const productUrl = `/products/${product.handle}`
        const isEven = index % 2 === 0

        // Extract specs from metadata
        const meta = product.metadata as Record<string, string> | undefined
        const material = meta?.material
        const weight = meta?.weight
        const hasSpecs = !!(material || weight)

        return (
          <article
            key={product.id}
            className="pb-12 lg:pb-[120px] px-3.5 lg:px-16"
          >
            {/* Desktop: alternating layout via CSS direction trick */}
            <div
                className="hidden lg:grid items-center"
                style={{
                  gridTemplateColumns: isEven ? "3fr 2fr" : "2fr 3fr",
                  gap: 80,
                  direction: isEven ? "ltr" : "rtl",
                }}
              >
                {/* Image side */}
                <div style={{ direction: "ltr" }}>
                  <ProductCard product={product} showSwatches />
                </div>

                {/* Text side */}
                <div style={{ direction: "ltr" }} className="py-6">
                  {categoryName && (
                    <span
                      className="font-mono uppercase text-[var(--color-muted)]"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.18em",
                      }}
                    >
                      {categoryName}
                    </span>
                  )}

                  <h2
                    className="font-medium mt-5"
                    style={{
                      fontSize: 28,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.02,
                    }}
                  >
                    {product.title}
                  </h2>

                  {priceLabel && (
                    <p className="font-medium mt-3" style={{ fontSize: 17 }}>
                      {priceLabel}
                    </p>
                  )}

                  {product.description && (
                    <p
                      className="text-[var(--color-body)] mt-4 max-w-[440px]"
                      style={{ fontSize: 14, lineHeight: 1.7 }}
                    >
                      {product.description}
                    </p>
                  )}

                  {/* Specs grid */}
                  {hasSpecs && (
                    <div
                      className="mt-6 max-w-[420px] border-t border-[var(--color-border)]"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "140px 1fr",
                        gap: 0,
                      }}
                    >
                      {material && (
                        <>
                          <span
                            className="font-mono uppercase text-[var(--color-muted)] py-3 border-b border-[var(--color-border)]"
                            style={{ fontSize: 10, letterSpacing: "0.16em" }}
                          >
                            Matière
                          </span>
                          <span className="text-[14px] py-3 border-b border-[var(--color-border)]">
                            {material}
                          </span>
                        </>
                      )}
                      {weight && (
                        <>
                          <span
                            className="font-mono uppercase text-[var(--color-muted)] py-3 border-b border-[var(--color-border)]"
                            style={{ fontSize: 10, letterSpacing: "0.16em" }}
                          >
                            Poids
                          </span>
                          <span className="text-[14px] py-3 border-b border-[var(--color-border)]">
                            {weight}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={productUrl}
                    className="inline-block mt-8 bg-[var(--color-ink)] text-[var(--color-surface)] font-mono uppercase transition-opacity hover:opacity-90 cursor-pointer"
                    style={{
                      padding: "16px 24px",
                      fontSize: 11,
                      letterSpacing: "0.22em",
                    }}
                  >
                    Voir la fiche produit ↗
                  </Link>
                </div>
              </div>

              {/* Mobile: image first, then text */}
              <div className="lg:hidden">
                <ProductCard product={product} showSwatches />

                <div className="mt-5">
                  {categoryName && (
                    <span
                      className="font-mono uppercase text-[var(--color-muted)]"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.18em",
                      }}
                    >
                      {categoryName}
                    </span>
                  )}

                  <h2
                    className="font-medium mt-3.5"
                    style={{
                      fontSize: 24,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.02,
                    }}
                  >
                    {product.title}
                  </h2>

                  {priceLabel && (
                    <p className="font-medium mt-3" style={{ fontSize: 17 }}>
                      {priceLabel}
                    </p>
                  )}

                  {product.description && (
                    <p
                      className="text-[var(--color-body)] mt-4"
                      style={{ fontSize: 14, lineHeight: 1.7 }}
                    >
                      {product.description}
                    </p>
                  )}

                  {hasSpecs && (
                    <div
                      className="mt-5 border-t border-[var(--color-border)]"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "140px 1fr",
                        gap: 0,
                      }}
                    >
                      {material && (
                        <>
                          <span
                            className="font-mono uppercase text-[var(--color-muted)] py-3 border-b border-[var(--color-border)]"
                            style={{ fontSize: 10, letterSpacing: "0.16em" }}
                          >
                            Matière
                          </span>
                          <span className="text-[14px] py-3 border-b border-[var(--color-border)]">
                            {material}
                          </span>
                        </>
                      )}
                      {weight && (
                        <>
                          <span
                            className="font-mono uppercase text-[var(--color-muted)] py-3 border-b border-[var(--color-border)]"
                            style={{ fontSize: 10, letterSpacing: "0.16em" }}
                          >
                            Poids
                          </span>
                          <span className="text-[14px] py-3 border-b border-[var(--color-border)]">
                            {weight}
                          </span>
                        </>
                      )}
                    </div>
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
              </div>
          </article>
        )
      })}
    </section>
  )
}
