"use client"

import { useState, useEffect, useRef } from "react"

type CollectionFilterBarProps = {
  sortOrder: string
  onSortChange: (order: string) => void
  density: 3 | 4
  onDensityChange: (d: 3 | 4) => void
  subcategories?: { id: string; handle: string; name: string }[]
  activeSubcategory?: string
  onSubcategoryChange?: (id: string) => void
  productCount?: number
  showDensity?: boolean
}

const SORT_OPTIONS = [
  { value: "-created_at", label: "Nouveautés" },
  { value: "title", label: "A-Z" },
  { value: "-title", label: "Z-A" },
  { value: "variants.calculated_price", label: "Prix croissant" },
  { value: "-variants.calculated_price", label: "Prix décroissant" },
]

export default function CollectionFilterBar({
  sortOrder,
  onSortChange,
  density,
  onDensityChange,
  subcategories,
  activeSubcategory,
  onSubcategoryChange,
  productCount,
  showDensity = true,
}: CollectionFilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [sortOpen])

  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === sortOrder)?.label ?? "Nouveautés"

  return (
    <div
      className="sticky top-14 lg:top-[66px] z-20 border-b border-[var(--color-border)]"
      style={{
        background: "rgba(250,250,248,0.92)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
      }}
    >
      {/* Subcategory tabs (if provided) */}
      {subcategories && subcategories.length > 0 && onSubcategoryChange && (
        <div className="flex gap-2 overflow-x-auto px-4 lg:px-8 pt-3 pb-3 border-b border-[var(--color-border)]" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => onSubcategoryChange("")}
            className={`font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              !activeSubcategory
                ? "bg-[var(--color-ink)] text-[var(--color-surface)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            Tout
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSubcategoryChange(sub.id)}
              className={`font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeSubcategory === sub.id
                  ? "bg-[var(--color-ink)] text-[var(--color-surface)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Main bar */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 gap-3 lg:gap-6">
        {/* Left: filters button + count */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Filters button */}
          <button
            className="flex items-center gap-2.5 bg-transparent border border-[var(--color-ink)] px-3.5 lg:px-4.5 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase cursor-pointer"
            aria-label="Ouvrir les filtres"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Filtres
          </button>

          {/* Product count (desktop) */}
          {productCount !== undefined && (
            <span className="hidden lg:block font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
              {productCount} pièces
            </span>
          )}
        </div>

        {/* Right: density + sort */}
        <div className="flex items-center gap-3 lg:gap-3.5">
          {/* Density toggle — desktop only, grid mode only */}
          {showDensity && (
            <div
              role="radiogroup"
              aria-label="Densité de la grille"
              className="hidden lg:flex border border-[var(--color-border)]"
            >
              {([3, 4] as const).map((n) => (
                <button
                  key={n}
                  aria-checked={density === n}
                  onClick={() => onDensityChange(n)}
                  className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    background: density === n ? "var(--color-ink)" : "transparent",
                    color: density === n ? "var(--color-surface)" : "var(--color-ink)",
                    border: "none",
                  }}
                >
                  <DensityIcon cols={n} />
                </button>
              ))}
            </div>
          )}

          {/* Sort dropdown */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2.5 bg-transparent border-none py-2.5 px-1 font-mono text-[10px] tracking-[0.2em] uppercase cursor-pointer"
            >
              <span className="hidden lg:inline">Tri · {currentLabel}</span>
              <span className="lg:hidden">Tri</span>
              <svg
                width="9" height="9" viewBox="0 0 10 10" fill="none"
                className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
              >
                <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.4" fill="none" />
              </svg>
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 min-w-[220px] bg-white border border-[var(--color-border)] shadow-lg z-10">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { onSortChange(option.value); setSortOpen(false) }}
                    className="block w-full text-left py-3 px-4 border-none border-b border-[var(--color-border)] text-[13px] cursor-pointer transition-colors"
                    style={{
                      background: sortOrder === option.value ? "var(--color-surface-warm, #F4F2ED)" : "transparent",
                      borderBottom: "1px solid var(--color-border)",
                      fontFamily: "inherit",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DensityIcon({ cols }: { cols: 3 | 4 }) {
  if (cols === 3) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="2" width="2" height="10" fill="currentColor" />
        <rect x="6" y="2" width="2" height="10" fill="currentColor" />
        <rect x="11" y="2" width="2" height="10" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="0" y="2" width="1.5" height="10" fill="currentColor" />
      <rect x="4" y="2" width="1.5" height="10" fill="currentColor" />
      <rect x="8.5" y="2" width="1.5" height="10" fill="currentColor" />
      <rect x="12.5" y="2" width="1.5" height="10" fill="currentColor" />
    </svg>
  )
}
