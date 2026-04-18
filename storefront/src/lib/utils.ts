import type { Product } from "@/types"

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}

export function getProductPrice(
  product: Product
): { amount: number; currencyCode: string } | null {
  const variant = product.variants?.[0]
  if (!variant) return null

  const price = variant.calculated_price?.calculated_amount
  const currencyCode = variant.calculated_price?.currency_code

  if (price != null && currencyCode) {
    return { amount: price, currencyCode }
  }

  return null
}

// Overlay types: how the navbar behaves over the page content
// - "dark-hero"  → transparent bg, white text, white logo (homepage, collections, categories)
// - "light-hero" → transparent bg, black text, black logo (product pages — light image backgrounds)
// - null         → solid white bg, black text (all other pages)
type OverlayType = "dark-hero" | "light-hero" | null

const DARK_HERO_ROUTES = [/^\/$/, /^\/collections\/.+/, /^\/boutique$/, /^\/categories\/.+/]
const LIGHT_HERO_ROUTES: RegExp[] = []

export function getOverlayType(pathname: string): OverlayType {
  if (DARK_HERO_ROUTES.some((re) => re.test(pathname))) return "dark-hero"
  if (LIGHT_HERO_ROUTES.some((re) => re.test(pathname))) return "light-hero"
  return null
}

export function isOverlayRoute(pathname: string): boolean {
  return getOverlayType(pathname) !== null
}
