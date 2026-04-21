"use client"

import Image from "next/image"
import { COLOR_MAP } from "@/lib/product-helpers"
import type { ColorImagesMap } from "@/lib/product-helpers"

type ColorSwatchesProps = {
  colors: { value: string; label: string }[]
  colorImages: ColorImagesMap
  selected: string
  onSelect: (color: string) => void
  isInStock?: (color: string) => boolean
  variant?: "default" | "compact" // default = PDP (w-20 h-[104px]), compact = drawer (w-16 h-20)
}

function getColorThumbnail(ci: ColorImagesMap, color: string): string | null {
  return ci[color]?.[0]?.url || null
}

export default function ColorSwatches({
  colors,
  colorImages,
  selected,
  onSelect,
  isInStock,
  variant = "default",
}: ColorSwatchesProps) {
  const thumbW = variant === "default" ? "w-20" : "w-16"
  const thumbH = variant === "default" ? "h-[104px]" : "h-20"
  const thumbSizes = variant === "default" ? "240px" : "192px"

  return (
    <div className="flex flex-wrap gap-2.5">
      {colors.map((c) => {
        const thumbnail = getColorThumbnail(colorImages, c.value)
        const isSelected = selected === c.value
        const color = COLOR_MAP[c.value] || "#cccccc"
        const inStock = isInStock ? isInStock(c.value) : true

        return (
          <button
            key={c.value}
            onClick={() => onSelect(c.value)}
            title={c.value}
            aria-label={`Couleur ${c.value}${!inStock ? " (épuisé)" : ""}`}
            className={`relative transition-all cursor-pointer ${
              thumbnail ? `${thumbW} ${thumbH}` : "w-10 h-10"
            } ${!inStock ? "opacity-30" : ""}`}
            style={!thumbnail ? {
              backgroundColor: color,
              border: isSelected ? "2px solid var(--color-ink)" : "1px solid var(--color-border)",
              boxShadow: isSelected ? "0 0 0 2px var(--color-surface) inset" : "none",
            } : undefined}
          >
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={c.value}
                fill
                className="object-cover"
                sizes={thumbSizes}
              />
            ) : (
              <span
                className="block w-full h-full"
                style={{ backgroundColor: color }}
              />
            )}
            {thumbnail && (
              <span
                className={`absolute -bottom-1.5 left-0 right-0 h-px transition-colors ${
                  isSelected ? "bg-black" : "bg-transparent"
                }`}
              />
            )}
            {!inStock && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="block w-[140%] h-px bg-black/40 -rotate-45" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
