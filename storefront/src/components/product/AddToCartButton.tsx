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
      setTimeout(() => setAdded(false), 2000) // show success for 2s
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!variantId || loading}
      className={`w-full py-3 px-6 text-sm font-medium uppercase tracking-wider transition-colors min-h-[44px] ${
        !variantId
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : added
          ? "bg-green-600 text-white"
          : "bg-black text-white hover:bg-black/90"
      }`}
    >
      {loading
        ? "Ajout en cours..."
        : added
        ? "Ajoute au panier !"
        : !variantId
        ? "Selectionnez les options"
        : "Ajouter au panier"}
    </button>
  )
}
