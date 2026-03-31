import { sdk } from "@/lib/sdk"
import { TAGS } from "@/lib/constants"
import type { Region } from "@/types"

export async function getRegions(): Promise<Region[]> {
  const { regions } = await sdk.store.region.list(
    { limit: 50 },
    { next: { tags: [TAGS.regions] } }
  )

  return regions as Region[]
}

export async function getRegion(regionId: string): Promise<Region | null> {
  try {
    const { region } = await sdk.store.region.retrieve(
      regionId,
      {},
      { next: { tags: [TAGS.regions] } }
    )
    return region as Region
  } catch {
    return null
  }
}
