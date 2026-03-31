import { sdk } from "@/lib/sdk"
import { REVALIDATE_PRODUCTS, TAGS } from "@/lib/constants"
import type { Product } from "@/types"

const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity"

export async function getProducts(params: {
  limit?: number
  offset?: number
  regionId: string
  categoryId?: string[]
  collectionId?: string[]
  q?: string
}): Promise<{ products: Product[]; count: number }> {
  const { products, count } = await sdk.store.product.list(
    {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      region_id: params.regionId,
      fields: PRODUCT_FIELDS,
      ...(params.categoryId && { category_id: params.categoryId }),
      ...(params.collectionId && { collection_id: params.collectionId }),
      ...(params.q && { q: params.q }),
    },
    { next: { tags: [TAGS.products] } }
  )

  return { products: products as Product[], count: count ?? 0 }
}

export async function getProductByHandle(
  handle: string,
  regionId: string
): Promise<Product | null> {
  const { products } = await sdk.store.product.list(
    {
      handle,
      region_id: regionId,
      fields: PRODUCT_FIELDS,
      limit: 1,
    },
    { next: { tags: [TAGS.products] } }
  )

  return (products?.[0] as Product) ?? null
}

export async function searchProducts(
  query: string,
  regionId: string,
  limit = 10
): Promise<Product[]> {
  const { products } = await sdk.store.product.list({
    q: query,
    region_id: regionId,
    fields: PRODUCT_FIELDS,
    limit,
  })

  return products as Product[]
}
