"use client"

import { useRef, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/providers/CartProvider"
import { formatPrice } from "@/lib/utils"
import type { LineItem } from "@/types"

const DEBOUNCE_MS = 400

export default function CartItem({ item, currencyCode = "eur" }: { item: LineItem; currencyCode?: string }) {
  const { updateItem, removeItem } = useCart()
  const thumbnail = item.thumbnail || item.variant?.product?.thumbnail

  // Optimistic local quantity for instant feedback during debounce
  const [localQty, setLocalQty] = useState(item.quantity)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [removing, setRemoving] = useState(false)

  // Sync localQty when server value changes (after mutation settles)
  if (localQty !== item.quantity && !debounceRef.current) {
    setLocalQty(item.quantity)
  }

  const debouncedUpdate = useCallback(
    (newQty: number) => {
      setLocalQty(newQty)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        if (newQty <= 0) {
          setRemoving(true)
          removeItem(item.id)
        } else {
          updateItem(item.id, newQty)
        }
      }, DEBOUNCE_MS)
    },
    [item.id, updateItem, removeItem]
  )

  const handleRemove = useCallback(() => {
    setRemoving(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = null
    removeItem(item.id)
  }, [item.id, removeItem])

  // Extract variant info (e.g. "Noir / M") — Medusa uses variant_title on line items
  const rawTitle = (item as unknown as Record<string, string>).variant_title || item.variant?.title || ""
  const variantLabel = rawTitle && rawTitle !== "Default" ? rawTitle : null

  return (
    <div className={`flex gap-4 py-5 border-b border-border transition-opacity duration-200 ${removing ? "opacity-30 pointer-events-none" : ""}`}>
      {/* Thumbnail — 3:4 ratio like product cards */}
      <div className="relative w-[72px] h-[96px] flex-shrink-0 overflow-hidden bg-[#f5f5f5]">
        {thumbnail ? (
          <Image src={thumbnail} alt={item.title} fill className="object-cover" sizes="72px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[9px]">
            —
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/products/${(item as unknown as Record<string, string>).product_handle || item.variant?.product?.handle || ""}`}
              className="text-[12px] font-medium leading-tight truncate hover:text-black/60 transition-colors"
            >
              {item.product_title || item.title}
            </Link>
            {/* Remove — small X icon */}
            <button
              onClick={handleRemove}
              className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Supprimer"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="0.75" />
              </svg>
            </button>
          </div>
          {/* Variant: color / size */}
          {variantLabel && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{variantLabel}</p>
          )}
        </div>

        {/* Bottom row: quantity + price */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity — minimal style */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => debouncedUpdate(localQty - 1)}
              disabled={localQty <= 1}
              className={`text-[11px] transition-colors ${
                localQty <= 1
                  ? "text-black/20 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground cursor-pointer"
              }`}
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span className="text-[11px] w-4 text-center tabular-nums">{localQty}</span>
            <button
              onClick={() => debouncedUpdate(localQty + 1)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>

          {/* Price — uses local qty for instant feedback */}
          <p className="text-[12px] tracking-[0.03em]">
            {formatPrice(item.unit_price * localQty, currencyCode)}
          </p>
        </div>
      </div>
    </div>
  )
}
