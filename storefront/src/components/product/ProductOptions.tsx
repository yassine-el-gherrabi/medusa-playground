"use client"

import type { Product } from "@/types"
import Link from "next/link"

type ProductOptionsProps = {
  product: Product
  selectedOptions: Record<string, string>
  onOptionChange: (optionId: string, value: string) => void
  selectedVariant: NonNullable<Product["variants"]>[number] | null
}

// Map to display color swatches
const COLOR_MAP: Record<string, string> = {
  "Noir": "#000000", "Black": "#000000",
  "Blanc": "#FFFFFF", "White": "#FFFFFF",
  "Bleu": "#1e3a5f", "Blue": "#1e3a5f",
  "Rouge": "#8b1a1a", "Red": "#8b1a1a",
  "Vert": "#2d4a2d", "Green": "#2d4a2d",
  "Gris": "#8a8a8a", "Grey": "#8a8a8a", "Gray": "#8a8a8a",
  "Beige": "#c8b89a",
  "Violet": "#4a2d6b", "Purple": "#4a2d6b",
  "Marron": "#5c3a1e", "Brown": "#5c3a1e",
  "Orange": "#cc6600",
  "Rose": "#d4a0a0", "Pink": "#d4a0a0",
  "Jaune": "#c4a82b", "Yellow": "#c4a82b",
  "Kaki": "#5b6b3c", "Khaki": "#5b6b3c",
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
}: ProductOptionsProps) {
  if (!product.options || product.options.length === 0) return null

  // Check stock for a specific option combo
  const isOptionInStock = (optionId: string, value: string): boolean => {
    if (!product.variants) return true
    // Build a hypothetical selection with this option changed
    const hypothetical = { ...selectedOptions, [optionId]: value }
    // Check if any variant matching this selection has stock
    return product.variants.some((variant) => {
      const matches = product.options!.every((opt) => {
        const sel = hypothetical[opt.id]
        if (!sel) return true // unselected options = don't filter
        const vo = variant.options?.find((o) => o.option_id === opt.id)
        return vo?.value === sel
      })
      return matches && (variant.inventory_quantity ?? 1) > 0
    })
  }

  return (
    <div className="space-y-6">
      {product.options.map((option) => {
        const isColor = isColorOption(option.title)
        const isSize = isSizeOption(option.title)
        const selectedValue = selectedOptions[option.id]

        return (
          <div key={option.id}>
            {/* Label with selected value */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] uppercase tracking-[0.15em]">
                {isColor ? "Couleur" : isSize ? "Taille" : option.title}
                {selectedValue && (
                  <span className="text-muted-foreground ml-2 normal-case tracking-normal">
                    {selectedValue}
                  </span>
                )}
              </p>
              {isSize && (
                <Link
                  href="/guide-des-tailles"
                  className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Guide des tailles
                </Link>
              )}
            </div>

            {/* Color swatches */}
            {isColor ? (
              <div className="flex flex-wrap gap-2">
                {option.values?.map((v) => {
                  const isSelected = selectedValue === v.value
                  const color = COLOR_MAP[v.value] || "#cccccc"
                  const inStock = isOptionInStock(option.id, v.value)
                  return (
                    <button
                      key={v.id}
                      onClick={() => inStock && onOptionChange(option.id, v.value)}
                      disabled={!inStock}
                      title={v.value}
                      className={`relative w-8 h-8 transition-all cursor-pointer ${
                        !inStock ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                    >
                      <span
                        className="block w-full h-full"
                        style={{ backgroundColor: color }}
                      />
                      {/* Underline indicator */}
                      <span
                        className={`absolute -bottom-1.5 left-0 right-0 h-px transition-colors ${
                          isSelected ? "bg-black" : "bg-transparent"
                        }`}
                      />
                      {/* Strikethrough for out of stock */}
                      {!inStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="block w-[140%] h-px bg-black/40 -rotate-45" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              /* Size / other options — text buttons with underline */
              <div className="flex flex-wrap gap-3">
                {option.values?.map((v) => {
                  const isSelected = selectedValue === v.value
                  const inStock = isOptionInStock(option.id, v.value)
                  return (
                    <button
                      key={v.id}
                      onClick={() => inStock && onOptionChange(option.id, v.value)}
                      disabled={!inStock}
                      className={`relative text-sm pb-1.5 transition-colors cursor-pointer ${
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
            )}
          </div>
        )
      })}
    </div>
  )
}
