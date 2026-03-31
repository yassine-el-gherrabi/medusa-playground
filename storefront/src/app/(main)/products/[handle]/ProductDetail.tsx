"use client"

import { useState, useMemo } from "react"
import ProductImages from "@/components/product/ProductImages"
import ProductOptions from "@/components/product/ProductOptions"
import AddToCartButton from "@/components/product/AddToCartButton"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    // Auto-select options if single variant
    if (product.variants?.length === 1 && product.options) {
      const defaults: Record<string, string> = {}
      product.options.forEach((opt) => {
        if (opt.values?.[0]) defaults[opt.id] = opt.values[0].value
      })
      return defaults
    }
    return {}
  })

  const selectedVariant = useMemo(() => {
    if (!product.variants || !product.options) return null
    return product.variants.find((variant) => {
      return product.options!.every((option) => {
        const selectedValue = selectedOptions[option.id]
        if (!selectedValue) return false
        const variantOption = variant.options?.find(
          (vo) => vo.option_id === option.id
        )
        return variantOption?.value === selectedValue
      })
    })
  }, [product, selectedOptions])

  const price = selectedVariant?.calculated_price
  const onOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <ProductImages images={product.images || []} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">{product.title}</h1>
            {price && (
              <p className="text-xl text-muted-foreground mt-2">
                {formatPrice(
                  price.calculated_amount!,
                  price.currency_code!
                )}
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <ProductOptions
            product={product}
            selectedOptions={selectedOptions}
            onOptionChange={onOptionChange}
          />

          <AddToCartButton variantId={selectedVariant?.id || null} />

          {/* Click & Collect */}
          <div className="flex items-start gap-3 pt-4 border-t border-border">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium">
                Retrait en boutique disponible
              </p>
              <p className="text-xs text-muted-foreground">
                Boutique Ice Industry Marseille — Prêt sous 24h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
