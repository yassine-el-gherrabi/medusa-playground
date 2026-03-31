"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/RegionProvider"
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions"
import SearchPreContent from "@/components/search/SearchPreContent"
import SearchSuggestions from "@/components/search/SearchSuggestions"
import SearchCategories from "@/components/search/SearchCategories"
import SearchProductGrid from "@/components/search/SearchProductGrid"
import type { Category, Product } from "@/types"

export default function SearchOverlay({
  isOpen,
  onClose,
  categories = [],
}: {
  isOpen: boolean
  onClose: () => void
  categories?: Category[]
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [loadingTrending, setLoadingTrending] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const trendingRegionRef = useRef<string | null>(null)
  const { region } = useRegion()

  const { suggestions, matchingCategories } = useSearchSuggestions(query, categories)

  // Focus + scroll lock + fetch trending
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus())
      document.body.style.overflow = "hidden"

      // Fetch trending products (re-fetch if region changed)
      if (region && trendingRegionRef.current !== region.id) {
        trendingRegionRef.current = region.id
        setLoadingTrending(true)
        sdk.store.product
          .list({
            limit: 8,
            region_id: region.id,
            fields: "*variants.calculated_price",
          })
          .then(({ products }) =>
            setTrendingProducts((products as Product[]) || [])
          )
          .catch(() => setTrendingProducts([]))
          .finally(() => setLoadingTrending(false))
      }
    } else {
      document.body.style.overflow = ""
      setQuery("")
      setResults([])
      setTotalCount(0)
      setActiveIndex(-1)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, region])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Search debounce
  useEffect(() => {
    if (!query.trim() || !region) {
      setResults([])
      setTotalCount(0)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { products, count } = await sdk.store.product.list({
          q: query,
          limit: 8,
          region_id: region.id,
          fields: "*variants.calculated_price",
        })
        setResults((products as Product[]) || [])
        setTotalCount(count || products?.length || 0)
      } catch {
        setResults([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }, 300) // ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, region])

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1)
  }, [suggestions])

  const handleSelectSuggestion = useCallback((term: string) => {
    setQuery(term)
    setActiveIndex(-1)
  }, [])

  // Keyboard navigation for suggestions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (suggestions.length === 0) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault()
        handleSelectSuggestion(suggestions[activeIndex])
      }
    },
    [suggestions, activeIndex, handleSelectSuggestion]
  )

  const hasQuery = query.trim().length > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] bg-white">
      <div className="max-w-5xl mx-auto pt-24 px-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-8 p-2 text-muted-foreground hover:text-foreground transition-opacity"
          aria-label="Fermer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Search input */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-5 h-5 absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls="search-suggestions"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher..."
            className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-border text-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Content area */}
        <div className="mt-8 max-h-[calc(100vh-200px)] overflow-y-auto pb-12">
          {!hasQuery ? (
            /* Pre-search content */
            <SearchPreContent
              categories={categories}
              trendingProducts={trendingProducts}
              loadingTrending={loadingTrending}
              onClose={onClose}
            />
          ) : (
            /* Live results */
            <div>
              <SearchSuggestions
                suggestions={suggestions}
                query={query}
                activeIndex={activeIndex}
                onSelect={handleSelectSuggestion}
              />
              <SearchCategories
                categories={matchingCategories}
                onClose={onClose}
              />
              <SearchProductGrid
                products={results}
                query={query}
                total={totalCount}
                loading={loading}
                onClose={onClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
