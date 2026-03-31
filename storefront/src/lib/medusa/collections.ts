import { sdk } from "@/lib/sdk"
import { TAGS } from "@/lib/constants"
import type { Collection } from "@/types"

export async function getCollections(
  limit = 20
): Promise<Collection[]> {
  const { collections } = await sdk.store.collection.list(
    {
      limit,
      fields: "+metadata",
    },
    { next: { tags: [TAGS.collections] } }
  )

  return collections as Collection[]
}

export async function getCollectionByHandle(
  handle: string
): Promise<Collection | null> {
  const { collections } = await sdk.store.collection.list(
    {
      handle,
      fields: "+metadata",
      limit: 1,
    },
    { next: { tags: [TAGS.collections] } }
  )

  return (collections?.[0] as Collection) ?? null
}
