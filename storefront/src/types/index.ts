import type { HttpTypes } from "@medusajs/types"

// Re-export Medusa store types for use throughout the app
export type Product = HttpTypes.StoreProduct
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
