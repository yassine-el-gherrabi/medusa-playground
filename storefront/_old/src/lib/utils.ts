export function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function getProductPrice(product: any): { amount: number; currencyCode: string } | null {
  const variant = product.variants?.[0]
  if (!variant) return null

  const price = variant.calculated_price?.calculated_amount
  const currencyCode = variant.calculated_price?.currency_code

  if (price != null && currencyCode) {
    return { amount: price, currencyCode }
  }

  return null
}

const OVERLAY_PATTERNS = [
  /^\/$/,
  /^\/collections\/.+/,
  /^\/boutique$/,
  /^\/categories\/.+/,
]

export function isOverlayRoute(pathname: string): boolean {
  return OVERLAY_PATTERNS.some((re) => re.test(pathname))
}

export function getHeroHeightFraction(pathname: string): number {
  if (pathname === "/") return 1.0
  if (isOverlayRoute(pathname)) return 0.7
  return 0
}
