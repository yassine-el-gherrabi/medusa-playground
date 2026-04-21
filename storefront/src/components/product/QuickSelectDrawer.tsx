"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import SizeGrid from "./SizeGrid"
import { useScrollLock } from "@/hooks/useScrollLock"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { formatPrice, getProductPrice } from "@/lib/utils"
import {
  extractColors,
  extractSizes,
  buildVariantMap,
  findVariantId,
  isSizeInStock,
  isColorInStock,
  getColorImages,
} from "@/lib/product-helpers"
import ColorSwatches from "./ColorSwatches"
import type { Product } from "@/types"

type QuickSelectDrawerProps = {
  open: boolean
  onClose: () => void
  product: Product
  onAddToCart: (variantId: string) => Promise<void>
  adding: boolean
  added: boolean
}

export default function QuickSelectDrawer({
  open,
  onClose,
  product,
  onAddToCart,
  adding,
  added,
}: QuickSelectDrawerProps) {
  const colors = extractColors(product)
  const sizes = extractSizes(product)
  const variants = buildVariantMap(product)
  const colorImages = getColorImages(product)
  const hasColorOption = product.options?.some((o) => ["color", "couleur"].includes(o.title?.toLowerCase() || "")) ?? false

  const [drawerColor, setDrawerColor] = useState(colors[0]?.value || "")
  const [drawerSize, setDrawerSize] = useState("")

  // Reset size on open
  useEffect(() => {
    if (open) setDrawerSize("")
  }, [open])

  useEscapeKey(open, onClose)
  useScrollLock(open)

  const canAdd = !!drawerSize && !!drawerColor
  const variantId = canAdd ? findVariantId(variants, drawerColor, drawerSize) : null
  const inStock = drawerSize ? isSizeInStock(variants, drawerColor, drawerSize) : true

  const handleAdd = async () => {
    if (!variantId) return
    await onAddToCart(variantId)
  }

  const priceData = getProductPrice(product)
  const price = priceData ? formatPrice(priceData.amount, priceData.currencyCode) : ""

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${open ? "bg-black/30 backdrop-blur-sm pointer-events-auto" : "bg-transparent backdrop-blur-none pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Sélection rapide"
        aria-modal={open}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-[61] bg-[var(--color-surface)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase">Sélection rapide</h2>
          <button onClick={onClose} className="p-2 -mr-2 cursor-pointer" aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Product summary */}
          <div className="flex gap-4 mb-6 pb-6 border-b border-[var(--color-border)]">
            {product.thumbnail && (
              <div className="w-20 h-24 bg-[var(--color-bg-subtle)] relative shrink-0">
                <Image src={product.thumbnail} alt={product.title} fill className="object-cover" sizes="80px" />
              </div>
            )}
            <div>
              <p className="text-[14px] font-medium">{product.title}</p>
              <p className="text-[14px] text-[var(--color-muted)] mt-1">{price}</p>
            </div>
          </div>

          {/* Color swatches */}
          {hasColorOption && colors.length > 0 && (
            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">Couleur</p>
                <span className="text-[13px] text-[var(--color-muted)]">{drawerColor}</span>
              </div>
              <ColorSwatches
                colors={colors}
                colorImages={colorImages}
                selected={drawerColor}
                onSelect={(c) => { setDrawerColor(c); setDrawerSize("") }}
                isInStock={(c) => isColorInStock(variants, c)}
                variant="compact"
              />
            </div>
          )}

          {/* Size grid */}
          {sizes.length > 0 && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-3">
                Taille
                {drawerSize && <span className="text-[var(--color-muted)] ml-2">— {drawerSize}</span>}
              </p>
              <SizeGrid
                sizes={sizes}
                selected={drawerSize}
                onSelect={setDrawerSize}
                isInStock={(size) => isSizeInStock(variants, drawerColor, size)}
              />
            </div>
          )}
        </div>

        {/* Fixed bottom CTA */}
        <div className="shrink-0 px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleAdd}
            disabled={!canAdd || adding || !inStock}
            className="w-full h-[52px] flex items-center justify-between px-5 text-[11px] font-medium uppercase tracking-[0.2em] border-none cursor-pointer transition-all"
            style={{
              background: canAdd && inStock ? "var(--color-ink)" : "var(--color-ink-soft)",
              color: "var(--color-surface)",
              opacity: canAdd && inStock ? 1 : 0.6,
              cursor: canAdd && inStock ? "pointer" : "not-allowed",
            }}
          >
            <span>{adding ? "Ajout..." : added ? "Ajouté ✓" : canAdd && !inStock ? "Épuisé" : canAdd ? `Ajouter · ${drawerColor} · ${drawerSize}` : "Sélectionner une taille"}</span>
            {price && <span className="tracking-[0.04em]">{price}</span>}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
