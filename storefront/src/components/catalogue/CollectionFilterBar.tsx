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
}: CollectionFilterBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [dropdownOpen])

  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === sortOrder)?.label ?? "Trier"

  return (
    <div className="border-b border-[var(--color-border)]">
      {/* Subcategory tabs (if provided) */}
      {subcategories && subcategories.length > 0 && onSubcategoryChange && (
        <div className="flex gap-2 overflow-x-auto px-5 lg:px-8 pt-3 pb-3 border-b border-[var(--color-border)] scrollbar-none">
          <button
            onClick={() => onSubcategoryChange("")}
            className={`font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 whitespace-nowrap transition-colors ${
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
              className={`font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 whitespace-nowrap transition-colors ${
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

      {/* Main bar: count left, sort + density right */}
      <div className="flex items-center justify-between px-5 lg:px-8 py-3 lg:py-4">
        {/* Left: product count */}
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
          {productCount !== undefined ? `${productCount} produits` : ""}
        </span>

        {/* Right: sort + density */}
        <div className="flex items-center gap-4">
          {/* Sort dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-body)]"
            >
              {currentLabel}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--color-border)] shadow-md min-w-[220px] z-10">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value)
                      setDropdownOpen(false)
                    }}
                    className={`block w-full text-left py-3 px-4 font-mono text-[11px] tracking-[0.14em] uppercase hover:bg-[var(--color-bg-subtle)] cursor-pointer transition-colors ${
                      sortOrder === option.value
                        ? "font-medium text-[var(--color-ink)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Density toggle — desktop only */}
          <div
            role="radiogroup"
            aria-label="Densit\u00e9 de la grille"
            className="hidden lg:flex items-center gap-1"
          >
            <button
              aria-checked={density === 3}
              onClick={() => onDensityChange(3)}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${
                density === 3
                  ? "bg-[var(--color-ink)] text-[var(--color-surface)]"
                  : "bg-transparent text-[var(--color-muted)] border border-[var(--color-border)]"
              }`}
            >
              {/* 3 vertical bars icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="2" height="10" fill="currentColor" />
                <rect x="6" y="2" width="2" height="10" fill="currentColor" />
                <rect x="11" y="2" width="2" height="10" fill="currentColor" />
              </svg>
            </button>
            <button
              aria-checked={density === 4}
              onClick={() => onDensityChange(4)}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${
                density === 4
                  ? "bg-[var(--color-ink)] text-[var(--color-surface)]"
                  : "bg-transparent text-[var(--color-muted)] border border-[var(--color-border)]"
              }`}
            >
              {/* 4 vertical bars icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="0" y="2" width="1.5" height="10" fill="currentColor" />
                <rect x="4" y="2" width="1.5" height="10" fill="currentColor" />
                <rect x="8.5" y="2" width="1.5" height="10" fill="currentColor" />
                <rect x="12.5" y="2" width="1.5" height="10" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
