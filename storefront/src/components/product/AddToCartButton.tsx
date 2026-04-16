"use client"

import { useState } from "react"
import { useCart } from "@/providers/CartProvider"

export default function AddToCartButton({
  variantId,
}: {
  variantId: string | null
}) {
  const { addItem } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const handleClick = async () => {
    if (!variantId) return
    setLoading(true)
    try {
      await addItem(variantId, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      // error handled by CartProvider
    } finally {
      setLoading(false)
    }
  }

  const disabled = !variantId || loading

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full h-[52px] text-[11px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer ${
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : added
            ? "bg-foreground text-background"
            : "bg-foreground text-background hover:bg-foreground/90"
      }`}
    >
      {loading
        ? "Ajout..."
        : added
          ? "Ajouté au panier"
          : !variantId
            ? "Sélectionnez vos options"
            : "Ajouter au panier"}
    </button>
  )
}
