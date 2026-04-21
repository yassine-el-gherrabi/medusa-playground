"use client"

import Image from "next/image"
import Link from "next/link"
import { getProductPrice, formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

type LookbookLayoutProps = {
  products: Product[]
}

export default function LookbookLayout({ products }: LookbookLayoutProps) {
  if (products.length === 0) return null

  return (
    <section aria-label="Produits">
      {products.map((product, index) => {
        const image = product.thumbnail || product.images?.[0]?.url || ""
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
            className="py-[60px] lg:py-[120px] px-5 lg:px-16 border-b border-[var(--color-border)]"
          >
            <div
              className={`grid grid-cols-1 lg:gap-20 ${
                isEven
                  ? "lg:grid-cols-[3fr_2fr]"
                  : "lg:grid-cols-[2fr_3fr]"
              }`}
            >
              {/* Image side */}
              <div className={`${!isEven ? "lg:order-2" : ""}`}>
                <Link href={productUrl} className="block">
                  <div className="relative aspect-[4/5] w-full bg-[var(--color-bg-subtle)] overflow-hidden">
                    {image && (
                      <Image
                        src={image}
                        alt={`${product.title} — Ice Industry`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    )}
                  </div>
                </Link>
              </div>

              {/* Text side */}
              <div
                className={`self-center mt-6 lg:mt-0 ${
                  !isEven ? "lg:order-1" : ""
                }`}
              >
                {categoryName && (
                  <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
                    {categoryName}
                  </span>
                )}

                <h2 className="text-[22px] font-medium mt-2">
                  {product.title}
                </h2>

                {priceLabel && (
                  <p className="text-[17px] font-medium mt-3">{priceLabel}</p>
                )}

                {product.description && (
                  <p className="text-[14px] text-[var(--color-body)] leading-relaxed mt-4">
                    {product.description}
                  </p>
                )}

                {/* Specs grid */}
                {hasSpecs && (
                  <div className="grid mt-6" style={{ gridTemplateColumns: "140px 1fr" }}>
                    {material && (
                      <>
                        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)] py-3 border-b border-[var(--color-border)]">
                          Matière
                        </span>
                        <span className="text-[14px] py-3 border-b border-[var(--color-border)]">
                          {material}
                        </span>
                      </>
                    )}
                    {weight && (
                      <>
                        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)] py-3 border-b border-[var(--color-border)]">
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
                  className="flex items-center justify-between w-full h-[52px] px-5 mt-8 bg-[var(--color-ink)] text-[var(--color-surface)] text-[11px] font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
                >
                  <span>Voir le produit</span>
                  <span>{priceLabel}</span>
                </Link>
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
