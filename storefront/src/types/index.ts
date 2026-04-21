import type { HttpTypes } from "@medusajs/types"

// Re-export Medusa store types for use throughout the app
export type Product = HttpTypes.StoreProduct & {
  collection_id?: string
  categories?: { id: string; name: string; handle?: string }[]
}

export type ProductMetadata = {
  model_info?: string
  editorial?: { label: string; text: string }[]
  features?: { title: string; text: string }[]
  color_images?: Record<string, { url: string }[]>
  compare_at_price?: number
  [key: string]: unknown
}

export type ProductVariant = HttpTypes.StoreProductVariant
export type Cart = HttpTypes.StoreCart
export type LineItem = HttpTypes.StoreCartLineItem
export type Customer = HttpTypes.StoreCustomer
export type Order = HttpTypes.StoreOrder
export type Region = HttpTypes.StoreRegion
export type Collection = HttpTypes.StoreCollection
export type Category = HttpTypes.StoreProductCategory
export type ShippingOption = HttpTypes.StoreCartShippingOption
export type Address = HttpTypes.StoreCartAddress
