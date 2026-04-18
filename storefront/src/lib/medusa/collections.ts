import { sdk } from "@/lib/sdk"
import { TAGS } from "@/lib/constants"
import { isBuildPhase } from "@/lib/medusa/cache"
import type { Collection } from "@/types"

const REVALIDATE = 3600

export async function getCollections(limit = 20): Promise<Collection[]> {
  if (isBuildPhase()) return []

  const { collections } = await sdk.store.collection.list(
    { limit, fields: "+metadata" },
    { next: { tags: [TAGS.collections], revalidate: REVALIDATE } } as any
  )

  return collections as Collection[]
}

export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  if (isBuildPhase()) return null

  const { collections } = await sdk.store.collection.list(
    { handle, fields: "+metadata", limit: 1 },
    { next: { tags: [TAGS.collections], revalidate: REVALIDATE } } as any
  )

  return (collections?.[0] as Collection) ?? null
}
