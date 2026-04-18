import { sdk } from "@/lib/sdk"
import { TAGS } from "@/lib/constants"
import type { Region } from "@/types"

const REVALIDATE = 86400 // 24h — regions rarely change

export async function getRegions(): Promise<Region[]> {
  const { regions } = await sdk.store.region.list(
    { limit: 50 },
    { next: { tags: [TAGS.regions], revalidate: REVALIDATE } } as any
  )

  return regions as Region[]
}

export async function getRegion(regionId: string): Promise<Region | null> {
  try {
    const { region } = await sdk.store.region.retrieve(
      regionId,
      {},
      { next: { tags: [TAGS.regions], revalidate: REVALIDATE } } as any
    )
    return region as Region
  } catch {
    return null
  }
}
