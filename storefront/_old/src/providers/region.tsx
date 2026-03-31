"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { sdk } from "@/lib/sdk"

type Region = {
  id: string
  name: string
  currency_code: string
  countries: { iso_2: string; display_name: string }[]
}

type RegionContextType = {
  region: Region | null
  regions: Region[]
  setRegion: (region: Region) => void
}

const RegionContext = createContext<RegionContextType>({
  region: null,
  regions: [],
  setRegion: () => {},
})

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region | null>(null)
  const [regions, setRegions] = useState<Region[]>([])

  useEffect(() => {
    sdk.store.region.list().then(({ regions }) => {
      setRegions(regions as Region[])
      const savedId = localStorage.getItem("region_id")
      const saved = regions.find((r: any) => r.id === savedId)
      const selected = (saved || regions[0]) as Region
      if (selected) {
        setRegionState(selected)
        localStorage.setItem("region_id", selected.id)
      }
    }).catch(console.error)
  }, [])

  const setRegion = (r: Region) => {
    setRegionState(r)
    localStorage.setItem("region_id", r.id)
  }

  return (
    <RegionContext.Provider value={{ region, regions, setRegion }}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  return useContext(RegionContext)
}
