"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import { formatPrice, getProductPrice } from "@/lib/utils"

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { region } = useRegion()

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      setQuery("")
      setResults([])
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim() || !region) {
      setResults([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { products } = await sdk.store.product.list({
          q: query,
          limit: 8,
          region_id: region.id,
          fields: "*variants.calculated_price",
        })
        setResults(products || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, region])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md">
      <div className="max-w-2xl mx-auto pt-24 px-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
          aria-label="Fermer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Search input */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-border text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Results */}
        <div className="mt-6 max-h-[60vh] overflow-y-auto">
          {loading && (
            <p className="text-sm text-muted-foreground">Recherche en cours...</p>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun resultat pour &ldquo;{query}&rdquo;</p>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((product: any) => {
                const priceData = getProductPrice(product)
                const thumbnail = product.thumbnail || product.images?.[0]?.url

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={onClose}
                  >
                    {thumbnail && (
                      <div className="relative w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={thumbnail}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.title}</p>
                      {priceData && (
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(priceData.amount, priceData.currencyCode)}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
