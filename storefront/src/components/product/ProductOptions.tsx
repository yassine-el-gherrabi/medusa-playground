"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types"

type ProductOptionsProps = {
  product: Product
  selectedOptions: Record<string, string>
  onOptionChange: (optionId: string, value: string) => void
  selectedVariant: NonNullable<Product["variants"]>[number] | null
  modelInfo?: string | null
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

type ColorImagesMap = Record<string, { url: string }[]>

function getColorImages(product: Product): ColorImagesMap {
  return ((product.metadata as Record<string, unknown> | null)?.color_images as ColorImagesMap) || {}
}

function getColorThumbnail(product: Product, colorImages: ColorImagesMap, colorValue: string): string | null {
  // First try metadata.color_images
  const ci = colorImages[colorValue]
  if (ci?.[0]?.url) return ci[0].url
  // Fallback: product thumbnail
  return null
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

  // Separate color and size options for ordering: color → model info → size
  const colorOption = product.options.find((o) => isColorOption(o.title))
  const sizeOption = product.options.find((o) => isSizeOption(o.title))
  const otherOptions = product.options.filter((o) => !isColorOption(o.title) && !isSizeOption(o.title))

  const renderColorSwatches = (option: NonNullable<Product["options"]>[number]) => {
    const selectedValue = selectedOptions[option.id]
    const colorImages = getColorImages(product)
    return (
      <div key={option.id}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] uppercase tracking-[0.15em]">
            Couleur
            {selectedValue && (
              <span className="text-muted-foreground ml-2 normal-case tracking-normal">
                {selectedValue}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {option.values?.map((v) => {
            const isSelected = selectedValue === v.value
            const thumbnail = getColorThumbnail(product, colorImages, v.value)
            const color = COLOR_MAP[v.value] || "#cccccc"
            const inStock = isOptionInStock(option.id, v.value)
            return (
              <button
                key={v.id}
                onClick={() => inStock && onOptionChange(option.id, v.value)}
                disabled={!inStock}
                title={v.value}
                className={`relative transition-all cursor-pointer ${
                  thumbnail ? "w-14 h-[74px]" : "w-10 h-10"
                } ${!inStock ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={v.value}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <span
                    className="block w-full h-full"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span
                  className={`absolute -bottom-1.5 left-0 right-0 h-px transition-colors ${
                    isSelected ? "bg-black" : "bg-transparent"
                  }`}
                />
                {!inStock && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="block w-[140%] h-px bg-black/40 -rotate-45" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderSizeButtons = (option: NonNullable<Product["options"]>[number]) => {
    const selectedValue = selectedOptions[option.id]
    return (
      <div key={option.id}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] uppercase tracking-[0.15em]">
            Taille
          </p>
          <Link
            href="/guide-des-tailles"
            className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Guide des tailles
          </Link>
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
  }

  return (
    <div className="space-y-6">
      {/* 1. Color swatches */}
      {colorOption && renderColorSwatches(colorOption)}

      {/* 2. Model info — between color and size, like Represent */}
      {modelInfo && (
        <p className="text-[12px] text-muted-foreground">
          {modelInfo}
        </p>
      )}

      {/* 3. Size buttons */}
      {sizeOption && renderSizeButtons(sizeOption)}

      {/* 4. Other options (material, etc.) */}
      {otherOptions.map((option) => {
        const selectedValue = selectedOptions[option.id]
        return (
          <div key={option.id}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] uppercase tracking-[0.15em]">
                {option.title}
                {selectedValue && (
                  <span className="text-muted-foreground ml-2 normal-case tracking-normal">
                    {selectedValue}
                  </span>
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
