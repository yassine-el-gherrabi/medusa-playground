import { sdk } from "@/lib/sdk"
import { TAGS } from "@/lib/constants"
import { isBuildPhase } from "@/lib/medusa/cache"
import type { Category } from "@/types"

const REVALIDATE = 3600

export async function getCategories(parentId?: string): Promise<Category[]> {
  if (isBuildPhase()) return []

  const { product_categories } = await sdk.store.category.list(
    {
      ...(parentId ? { parent_category_id: parentId } : { parent_category_id: "null" }),
      fields: "+category_children,+metadata",
      limit: 50,
    },
    { next: { tags: [TAGS.categories], revalidate: REVALIDATE } } as any
  )

  return product_categories as Category[]
}

export async function getCategoryByHandle(handle: string): Promise<Category | null> {
  if (isBuildPhase()) return null

  const { product_categories } = await sdk.store.category.list(
    { handle, fields: "+category_children,+metadata", limit: 1 },
    { next: { tags: [TAGS.categories], revalidate: REVALIDATE } } as any
  )

  return (product_categories?.[0] as Category) ?? null
}
