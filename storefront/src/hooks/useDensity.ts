"use client"
import { useState, useEffect } from "react"

export function useDensity(defaultDensity: 3 | 4 = 3): [3 | 4, (d: 3 | 4) => void] {
  const [density, setDensity] = useState<3 | 4>(defaultDensity)

  useEffect(() => {
    const stored = localStorage.getItem("catalogue_density")
    if (stored === "3" || stored === "4") setDensity(Number(stored) as 3 | 4)
  }, [])

  const updateDensity = (d: 3 | 4) => {
    setDensity(d)
    localStorage.setItem("catalogue_density", String(d))
  }

  return [density, updateDensity]
}
