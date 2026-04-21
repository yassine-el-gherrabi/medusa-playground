"use client"
import { useState, useEffect } from "react"

// Density levels: 0 = sparse, 1 = default, 2 = dense
// Mobile:  0 → 1col, 1 → 2col, 2 → 3col
// Desktop: 0 → 3col, 1 → 4col, 2 → 6col
export type DensityLevel = 0 | 1 | 2

export function useDensity(defaultLevel: DensityLevel = 1): [DensityLevel, (d: DensityLevel) => void] {
  const [level, setLevel] = useState<DensityLevel>(defaultLevel)

  useEffect(() => {
    const stored = localStorage.getItem("catalogue_density")
    if (stored === "0" || stored === "1" || stored === "2") setLevel(Number(stored) as DensityLevel)
  }, [])

  const updateLevel = (d: DensityLevel) => {
    setLevel(d)
    localStorage.setItem("catalogue_density", String(d))
  }

  return [level, updateLevel]
}

// Grid class mapping
export function getDensityClasses(level: DensityLevel) {
  switch (level) {
    case 0: return { cols: "grid-cols-1 lg:grid-cols-3", gap: "gap-x-2 gap-y-5 lg:gap-x-14 lg:gap-y-6" }
    case 1: return { cols: "grid-cols-2 lg:grid-cols-4", gap: "gap-x-2 gap-y-5 lg:gap-x-10 lg:gap-y-4" }
    case 2: return { cols: "grid-cols-3 lg:grid-cols-6", gap: "gap-x-1.5 gap-y-4 lg:gap-x-6 lg:gap-y-3" }
  }
}
