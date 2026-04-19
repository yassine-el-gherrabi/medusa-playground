import type { Product } from "@/types"

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
  return ((product.metadata as Record<string, unknown> | null)?.color_images as ColorImagesMap) || {}
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

// ── Metadata ──

export function getCompareAtPrice(product: Product): number | null {
  const meta = (product.metadata as Record<string, unknown>) || {}
  return (meta.compare_at_price as number) || null
}
