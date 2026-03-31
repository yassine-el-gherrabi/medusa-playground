"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { DEFAULT_REGION } from "@/lib/constants"
import type { Region } from "@/types"

type RegionContextType = {
  region: Region | null
  regionId: string
  regionError: string
  setRegionId: (id: string) => void
}

const RegionContext = createContext<RegionContextType>({
  region: null,
  regionId: DEFAULT_REGION,
  regionError: "",
  setRegionId: () => {},
})

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [regionId, setRegionId] = useState(DEFAULT_REGION)
  const [region, setRegion] = useState<Region | null>(null)
  const [regionError, setRegionError] = useState("")

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { region } = await sdk.store.region.retrieve(regionId)
        if (!cancelled) {
          setRegionError("")
          setRegion(region as Region)
        }
      } catch (err) {
        if (!cancelled) {
          setRegionError(
            err instanceof Error
              ? err.message
              : "Impossible de charger la région."
          )
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [regionId])

  return (
    <RegionContext.Provider value={{ region, regionId, regionError, setRegionId }}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  const ctx = useContext(RegionContext)
  if (!ctx) throw new Error("useRegion must be used within RegionProvider")
  return ctx
}
