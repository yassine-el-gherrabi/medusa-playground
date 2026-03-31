"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { DEFAULT_REGION } from "@/lib/constants"
import type { Region } from "@/types"

type RegionContextType = {
  region: Region | null
  regionId: string
  setRegionId: (id: string) => void
}

const RegionContext = createContext<RegionContextType>({
  region: null,
  regionId: DEFAULT_REGION,
  setRegionId: () => {},
})

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [regionId, setRegionId] = useState(DEFAULT_REGION)
  const [region, setRegion] = useState<Region | null>(null)

  useEffect(() => {
    sdk.store.region
      .retrieve(regionId)
      .then(({ region }) => setRegion(region as Region))
      .catch(console.error)
  }, [regionId])

  return (
    <RegionContext.Provider value={{ region, regionId, setRegionId }}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  const ctx = useContext(RegionContext)
  if (!ctx) throw new Error("useRegion must be used within RegionProvider")
  return ctx
}
