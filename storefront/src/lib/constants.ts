export const SITE_NAME = "Ice Industry"
export const SITE_DESCRIPTION =
  "Marque de streetwear basée à Marseille. Capsules exclusives, accessoires et chaussures multi-marques."
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://iceindustry.fr"
export const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || ""
export const DEFAULT_CURRENCY = "eur"
export const DEFAULT_COUNTRY = "fr"

// Shipping
export const FREE_SHIPPING_THRESHOLD = 300 // euros

// Revalidation intervals (seconds)
export const REVALIDATE_PRODUCTS = 120
export const REVALIDATE_COLLECTIONS = 120
export const REVALIDATE_CATEGORIES = 300

// Cache tags for on-demand revalidation
export const TAGS = {
  products: "products",
  collections: "collections",
  categories: "categories",
  regions: "regions",
} as const
