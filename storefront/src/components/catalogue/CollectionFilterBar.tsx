"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { useScrollLock } from "@/hooks/useScrollLock"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { COLOR_MAP } from "@/lib/product-helpers"

// ── Types ──

export type FilterState = {
  sort: string
  categories: string[]
  sizes: string[]
  colors: string[]
  priceRange: [number, number] | null
}

export type FilterOptions = {
  categories: string[]
  sizeGroups: { label: string; sizes: string[] }[]
  colors: { name: string; hex: string }[]
  priceRange: [number, number]
}

export const DEFAULT_FILTERS: FilterState = {
  sort: "-created_at",
  categories: [],
  sizes: [],
  colors: [],
  priceRange: null,
}

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
  filterOptions: FilterOptions
  activeFilters: FilterState
  onFiltersApply: (filters: FilterState) => void
}

const SORT_OPTIONS = [
  { value: "-created_at", label: "Plus récent" },
  { value: "created_at", label: "Moins récent" },
  { value: "-variants.calculated_price", label: "Prix décroissant" },
  { value: "variants.calculated_price", label: "Prix croissant" },
]

function countActiveFilters(filters: FilterState, defaultPriceRange: [number, number]): number {
  let count = 0
  count += filters.categories.length
  count += filters.sizes.length
  count += filters.colors.length
  if (
    filters.priceRange &&
    (filters.priceRange[0] !== defaultPriceRange[0] || filters.priceRange[1] !== defaultPriceRange[1])
  ) {
    count += 1
  }
  return count
}

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
  filterOptions,
  activeFilters,
  onFiltersApply,
}: CollectionFilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sortOpen) return
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [sortOpen])

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label ?? "Plus récent"
  const badgeCount = countActiveFilters(activeFilters, filterOptions.priceRange)

  const handleQuickSort = (value: string) => {
    onSortChange(value)
    setSortOpen(false)
  }

  const handleFiltersApply = useCallback(
    (filters: FilterState) => {
      onFiltersApply(filters)
      setFiltersOpen(false)
    },
    [onFiltersApply]
  )

  return (
    <>
      <div
        className="border-b border-[var(--color-border)] bg-white"
      >
        {/* Subcategory tabs */}
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

        {/* Main bar — pure typography, no borders */}
        <div className="flex items-center justify-between px-5 lg:px-8 py-4 lg:py-5">
          {/* Left: filters + count */}
          <div className="flex items-center gap-5 lg:gap-6">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 bg-transparent border-none p-0 font-mono text-[10px] tracking-[0.2em] uppercase cursor-pointer hover:opacity-50 transition-opacity"
              aria-label="Ouvrir les filtres"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              Filtres
              {badgeCount > 0 && (
                <span className="ml-0.5 text-[9px]">({badgeCount})</span>
              )}
            </button>

            {productCount !== undefined && (
              <span className="hidden lg:block font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                {productCount} pièces
              </span>
            )}
          </div>

          {/* Right: density + sort */}
          <div className="flex items-center gap-4 lg:gap-5">
            {showDensity && (
              <div
                role="radiogroup"
                aria-label="Densité de la grille"
                className="hidden lg:flex items-center gap-1"
              >
                {([3, 4] as const).map((n) => (
                  <button
                    key={n}
                    aria-checked={density === n}
                    onClick={() => onDensityChange(n)}
                    className={`w-7 h-7 flex items-center justify-center cursor-pointer transition-opacity border-none bg-transparent p-0 ${
                      density === n ? "opacity-100" : "opacity-30 hover:opacity-60"
                    }`}
                  >
                    <DensityIcon cols={n} />
                  </button>
                ))}
              </div>
            )}

            <div ref={sortRef} className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 bg-transparent border-none p-0 font-mono text-[10px] tracking-[0.2em] uppercase cursor-pointer hover:opacity-50 transition-opacity"
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
                      onClick={() => handleQuickSort(option.value)}
                      className={`block w-full text-left py-3 px-4 text-[13px] cursor-pointer transition-colors border-none hover:bg-[var(--color-bg-subtle)] ${
                        sortOrder === option.value
                          ? "bg-[var(--color-ink)] text-[var(--color-surface)] hover:bg-[var(--color-ink)]"
                          : "bg-white text-[var(--color-ink)]"
                      }`}
                      style={{ borderBottom: "1px solid var(--color-border)" }}
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

      {/* Filters drawer */}
      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        onApply={handleFiltersApply}
      />
    </>
  )
}

// ── Filters Drawer ──

type FiltersDrawerProps = {
  open: boolean
  onClose: () => void
  filterOptions: FilterOptions
  activeFilters: FilterState
  onApply: (filters: FilterState) => void
}

function FiltersDrawer({ open, onClose, filterOptions, activeFilters, onApply }: FiltersDrawerProps) {
  useScrollLock(open)
  useEscapeKey(open, useCallback(() => onClose(), [onClose]))

  // Draft state — local copy that only commits on "Voir les résultats"
  const [draft, setDraft] = useState<FilterState>(activeFilters)

  // Sync draft when drawer opens
  useEffect(() => {
    if (open) setDraft(activeFilters)
  }, [open, activeFilters])

  const draftActiveCount = countActiveFilters(draft, filterOptions.priceRange)

  // Flatten all size groups into a single deduplicated list
  const allSizes = [...new Set(filterOptions.sizeGroups.flatMap((g) => g.sizes))]

  // ── Draft updaters ──

  const setDraftSort = (value: string) => {
    setDraft((prev) => ({ ...prev, sort: value }))
  }

  const toggleCategory = (cat: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  const toggleSize = (size: string) => {
    setDraft((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }

  const toggleColor = (color: string) => {
    setDraft((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }))
  }

  const setPriceRange = (range: [number, number]) => {
    setDraft((prev) => ({ ...prev, priceRange: range }))
  }

  const clearAll = () => {
    setDraft({
      ...DEFAULT_FILTERS,
      sort: draft.sort, // keep current sort when clearing
    })
  }

  const handleApply = () => {
    onApply(draft)
  }

  if (typeof document === "undefined") return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[80] transition-all duration-300 ${open ? "bg-black/45 backdrop-blur-sm pointer-events-auto" : "bg-transparent backdrop-blur-none pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Filtres"
        aria-modal={open}
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] z-[81] bg-white flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 lg:px-9 pt-6 lg:pt-9 pb-8 shrink-0">
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">Affiner</span>
            <h3 className="text-[28px] font-medium tracking-[-0.02em] mt-1.5">Filtres</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-transparent cursor-pointer flex items-center justify-center hover:opacity-60 transition-opacity"
            aria-label="Fermer les filtres"
          >
            <svg width="12" height="12" viewBox="0 0 11 11"><path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-9">

          {/* Section: TRIER PAR */}
          <div className="pb-6 mb-6 border-b border-[var(--color-border)]">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4">Trier par</p>
            <div className="flex flex-col">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDraftSort(option.value)}
                  className="flex items-center gap-3 py-3 border-b border-[var(--color-border)] text-[13px] cursor-pointer bg-transparent border-x-0 border-t-0 text-left hover:bg-[var(--color-bg-subtle)] transition-colors px-2 -mx-2"
                >
                  <span
                    className="w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0"
                    style={{
                      borderColor: draft.sort === option.value ? "var(--color-ink)" : "var(--color-border)",
                    }}
                  >
                    {draft.sort === option.value && (
                      <span className="w-[10px] h-[10px] rounded-full bg-[var(--color-ink)]" />
                    )}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: PRIX */}
          {filterOptions.priceRange[0] < filterOptions.priceRange[1] && (
            <div className="pb-6 mb-6 border-b border-[var(--color-border)]">
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4">Prix</p>
              <PriceRangeSlider
                min={filterOptions.priceRange[0]}
                max={filterOptions.priceRange[1]}
                value={draft.priceRange || filterOptions.priceRange}
                onChange={setPriceRange}
              />
            </div>
          )}

          {/* Section: CATÉGORIE */}
          {filterOptions.categories.length > 0 && (
            <div className="pb-6 mb-6 border-b border-[var(--color-border)]">
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4">Catégorie</p>
              <div className="flex flex-wrap gap-2">
                {filterOptions.categories.map((cat) => {
                  const isActive = draft.categories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`py-2.5 px-3.5 text-[13px] cursor-pointer transition-colors border ${
                        isActive
                          ? "bg-[var(--color-ink)] text-[var(--color-surface)] border-[var(--color-ink)]"
                          : "bg-transparent text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-ink)]"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Section: TAILLE */}
          {allSizes.length > 0 && (
            <div className="pb-6 mb-6 border-b border-[var(--color-border)]">
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4">Taille</p>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => {
                  const isActive = draft.sizes.includes(size)
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`min-w-[42px] py-2.5 px-3 text-[13px] text-center cursor-pointer transition-colors border ${
                        isActive
                          ? "bg-[var(--color-ink)] text-[var(--color-surface)] border-[var(--color-ink)]"
                          : "bg-transparent text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-ink)]"
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Section: COULEUR */}
          {filterOptions.colors.length > 0 && (
            <div className="pb-6 mb-6 border-b border-[var(--color-border)]">
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4">Couleur</p>
              <div className="flex flex-wrap gap-2">
                {filterOptions.colors.map((color) => {
                  const isActive = draft.colors.includes(color.name)
                  return (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`flex items-center gap-2 py-2.5 px-3.5 text-[13px] cursor-pointer transition-colors border ${
                        isActive
                          ? "bg-[var(--color-ink)] text-[var(--color-surface)] border-[var(--color-ink)]"
                          : "bg-transparent text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-ink)]"
                      }`}
                    >
                      <span
                        className="w-3 h-3 shrink-0"
                        style={{
                          backgroundColor: color.hex,
                          border: isActive ? "1.5px solid white" : "1px solid var(--color-border)",
                        }}
                      />
                      {color.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="shrink-0 px-6 lg:px-9 py-6 border-t border-[var(--color-border)]">
          <div className="grid grid-cols-[1fr_2fr] gap-2.5">
            <button
              onClick={clearAll}
              className="bg-transparent border border-[var(--color-ink)] py-4 px-4 font-mono text-[10px] tracking-[0.22em] uppercase cursor-pointer hover:bg-[var(--color-ink)] hover:text-[var(--color-surface)] transition-colors"
            >
              Effacer{draftActiveCount > 0 ? ` (${draftActiveCount})` : ""}
            </button>
            <button
              onClick={handleApply}
              className="border-none py-4 px-4 font-mono text-[12px] font-medium tracking-[0.22em] uppercase cursor-pointer"
              style={{ background: "var(--color-ink)", color: "var(--color-surface)" }}
            >
              Voir les résultats
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

// ── Price Range Slider ──

function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (range: [number, number]) => void
}) {
  const step = 10
  const [localMin, localMax] = value

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localMax - step)
    onChange([newMin, localMax])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localMin + step)
    onChange([localMin, newMax])
  }

  const leftPercent = ((localMin - min) / (max - min)) * 100
  const rightPercent = ((localMax - min) / (max - min)) * 100

  return (
    <div className="pt-2 pb-1">
      {/* Track */}
      <div className="relative h-[2px] w-full bg-[var(--color-border)] my-4">
        {/* Active range */}
        <div
          className="absolute h-full bg-[var(--color-ink)]"
          style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
        />
      </div>

      {/* Inputs stacked */}
      <div className="relative h-4 -mt-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          className="filter-range-input absolute w-full h-full appearance-none bg-transparent pointer-events-none z-[3]"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          className="filter-range-input absolute w-full h-full appearance-none bg-transparent pointer-events-none z-[4]"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-3">
        <span className="font-mono text-[11px] text-[var(--color-muted)]">{localMin} €</span>
        <span className="font-mono text-[11px] text-[var(--color-muted)]">{localMax} €</span>
      </div>
    </div>
  )
}

// ── Density icon ──

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
      <rect x="1" y="2" width="1.5" height="10" fill="currentColor" />
      <rect x="4.5" y="2" width="1.5" height="10" fill="currentColor" />
      <rect x="8" y="2" width="1.5" height="10" fill="currentColor" />
      <rect x="11.5" y="2" width="1.5" height="10" fill="currentColor" />
    </svg>
  )
}
