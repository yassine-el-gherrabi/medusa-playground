"use client"

import AnimatedLink from "@/components/ui/AnimatedLink"
import SizeGrid from "./SizeGrid"
import ColorSwatches from "./ColorSwatches"
import type { Product } from "@/types"
import { getColorImages } from "@/lib/product-helpers"

type ProductOptionsProps = {
  product: Product
  selectedOptions: Record<string, string>
  onOptionChange: (optionId: string, value: string) => void
  selectedVariant: NonNullable<Product["variants"]>[number] | null
  modelInfo?: string | null
}

function isColorOption(title: string): boolean {
  return ["color", "couleur"].includes(title.toLowerCase())
}

function isSizeOption(title: string): boolean {
  return ["size", "taille", "pointure"].includes(title.toLowerCase())
}

export default function ProductOptions({
  product,
  selectedOptions,
  onOptionChange,
  selectedVariant,
  modelInfo,
}: ProductOptionsProps) {
  if (!product.options || product.options.length === 0) return null

  const isOptionInStock = (optionId: string, value: string): boolean => {
    if (!product.variants) return true
    const hypothetical = { ...selectedOptions, [optionId]: value }
    return product.variants.some((variant) => {
      const matches = product.options!.every((opt) => {
        const sel = hypothetical[opt.id]
        if (!sel) return true
        const vo = variant.options?.find((o) => o.option_id === opt.id)
        return vo?.value === sel
      })
      return matches && (variant.inventory_quantity ?? 1) > 0
    })
  }

  const colorOption = product.options.find((o) => isColorOption(o.title))
  const sizeOption = product.options.find((o) => isSizeOption(o.title))
  const otherOptions = product.options.filter((o) => !isColorOption(o.title) && !isSizeOption(o.title))

  const renderColorSwatches = (option: NonNullable<Product["options"]>[number]) => {
    const selectedValue = selectedOptions[option.id]
    const colorImages = getColorImages(product)
    const colorValues = (option.values || []).map((v) => ({ value: v.value, label: v.value }))
    return (
      <div key={option.id}>
        <div className="flex items-baseline justify-between mb-3.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em]">Couleur</p>
          {selectedValue && (
            <span className="text-[13px] text-muted-foreground">{selectedValue}</span>
          )}
        </div>
        <ColorSwatches
          colors={colorValues}
          colorImages={colorImages}
          selected={selectedValue || ""}
          onSelect={(value) => onOptionChange(option.id, value)}
          isInStock={(color) => isOptionInStock(option.id, color)}
          variant="default"
        />
      </div>
    )
  }

  const renderSizeGrid = (option: NonNullable<Product["options"]>[number]) => {
    const selectedValue = selectedOptions[option.id]
    const values = option.values || []
    return (
      <div key={option.id}>
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
            Taille
            {selectedValue && (
              <span className="text-muted-foreground ml-2">— {selectedValue}</span>
            )}
          </p>
          <AnimatedLink
            href="/guide-des-tailles"
            className="font-mono text-[10px] uppercase tracking-[0.14em]"
          >
            Guide des tailles
          </AnimatedLink>
        </div>
        <SizeGrid
          sizes={values.map((v) => ({ value: v.value, label: v.value }))}
          selected={selectedValue || ""}
          onSelect={(value) => onOptionChange(option.id, value)}
          isInStock={(size) => isOptionInStock(option.id, size)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {colorOption && renderColorSwatches(colorOption)}
      {modelInfo && (
        <p className="text-[12px] text-[var(--color-muted)] leading-relaxed">{modelInfo}</p>
      )}
      {sizeOption && renderSizeGrid(sizeOption)}
      {otherOptions.map((option) => {
        const selectedValue = selectedOptions[option.id]
        return (
          <div key={option.id}>
            <div className="flex items-baseline justify-between mb-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                {option.title}
                {selectedValue && (
                  <span className="text-muted-foreground ml-2">— {selectedValue}</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {option.values?.map((v) => {
                const isSelected = selectedValue === v.value
                const inStock = isOptionInStock(option.id, v.value)
                return (
                  <button
                    key={v.id}
                    onClick={() => inStock && onOptionChange(option.id, v.value)}
                    disabled={!inStock}
                    aria-label={`${option.title} ${v.value}`}
                    className={`relative text-[14px] pb-2 transition-colors cursor-pointer ${
                      isSelected
                        ? "text-foreground font-medium"
                        : inStock
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-black/20 line-through cursor-not-allowed"
                    }`}
                  >
                    {v.value}
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-px transition-colors ${
                        isSelected ? "bg-black" : "bg-transparent"
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
