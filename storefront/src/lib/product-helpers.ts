import type { Product, ProductMetadata } from "@/types"

// ── Types ──

export type ColorOption = { value: string; label: string }
export type SizeOption = { value: string; label: string }
export type VariantInfo = { id: string; color: string; size: string; inStock: boolean }
export type ColorImagesMap = Record<string, { url: string }[]>

// ── Extractors ──

export function extractColors(product: Product): ColorOption[] {
  const opt = product.options?.find((o) =>
    ["color", "couleur"].includes(o.title?.toLowerCase() || "")
  )
  if (opt?.values?.length) return opt.values.map((v) => ({ value: v.value, label: v.value }))
  return [{ value: "Noir", label: "Noir" }]
}

export function extractSizes(product: Product): SizeOption[] {
  const opt = product.options?.find((o) =>
    ["size", "taille", "pointure"].includes(o.title?.toLowerCase() || "")
  )
  return opt?.values?.map((v) => ({ value: v.value, label: v.value })) || []
}

export function buildVariantMap(product: Product): VariantInfo[] {
  if (!product.variants) return []

  // Build a map: option_id → type ("color" | "size" | "other")
  // Using product-level options which always have titles
  const optionTypeMap: Record<string, "color" | "size" | "other"> = {}
  product.options?.forEach((opt) => {
    const title = opt.title?.toLowerCase() || ""
    if (["color", "couleur"].includes(title)) optionTypeMap[opt.id] = "color"
    else if (["size", "taille", "pointure"].includes(title)) optionTypeMap[opt.id] = "size"
    else optionTypeMap[opt.id] = "other"
  })

  return product.variants.map((v) => {
    let color = "Noir"
    let size = ""
    v.options?.forEach((o) => {
      const type = optionTypeMap[o.option_id || ""]
      if (type === "color") color = o.value
      else if (type === "size") size = o.value
    })
    return {
      id: v.id,
      color,
      size,
      inStock: (v.inventory_quantity ?? 1) > 0,
    }
  })
}

export function findVariantId(variants: VariantInfo[], color: string, size: string): string | null {
  const exact = variants.find((v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase())
  if (exact) return exact.id
  const bySize = variants.find((v) => v.size.toLowerCase() === size.toLowerCase())
  return bySize?.id ?? variants[0]?.id ?? null
}

export function isSizeInStock(variants: VariantInfo[], color: string, size: string): boolean {
  const match = variants.find((v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase())
  if (match) return match.inStock
  const bySize = variants.find((v) => v.size.toLowerCase() === size.toLowerCase())
  return bySize?.inStock ?? false
}

// ── Images ──

export function getColorImages(product: Product): ColorImagesMap {
  const meta = product.metadata as ProductMetadata | null
  return meta?.color_images || {}
}

export function getImageForColor(product: Product, ci: ColorImagesMap, color: string): string {
  return ci[color]?.[0]?.url || product.thumbnail || product.images?.[0]?.url || ""
}

export function getSecondImage(product: Product, ci: ColorImagesMap, color: string): string {
  return ci[color]?.[1]?.url || product.images?.[1]?.url || ""
}

/** Get the first image URL for a color — used as thumbnail swatch */
export function getColorThumbnail(ci: ColorImagesMap, color: string): string | null {
  return ci[color]?.[0]?.url || null
}

// ── Colors ──

export const COLOR_MAP: Record<string, string> = {
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
  "noir v2": "#111", "noir/gris": "#444",
}

/**
 * Get the thumbnail for a specific color from a variant_title string.
 * Used in cart items where we only have the variant title ("Noir / M")
 * and the product metadata (which might not be available).
 */
export function getThumbnailForVariantTitle(
  variantTitle: string,
  metadata: Record<string, unknown> | null | undefined
): string | null {
  if (!variantTitle || !metadata) return null
  const colorName = variantTitle.split(" / ")[0]?.trim()
  if (!colorName) return null
  const ci = (metadata.color_images as ColorImagesMap) || {}
  return ci[colorName]?.[0]?.url || null
}

// ── Metadata ──

export function getCompareAtPrice(product: Product): number | null {
  const meta = product.metadata as ProductMetadata | null
  const val = meta?.compare_at_price
  return typeof val === "number" && val > 0 ? val : null
}
