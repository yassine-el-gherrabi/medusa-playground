"use client"

import Link from "next/link"
import { useCart } from "@/providers/cart"
import CartItem from "@/components/cart/CartItem"
import CartSummary from "@/components/cart/CartSummary"
import { Skeleton } from "@/components/ui/Skeleton"

export default function CartPage() {
  const { cart, loading } = useCart()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        <Skeleton variant="text" className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="card" className="h-28" />
            ))}
          </div>
          <Skeleton variant="card" className="h-64" />
        </div>
      </div>
    )
  }

  const items = cart?.items || []

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-8">
          Ajoutez des produits pour commencer.
        </p>
        <Link
          href="/voir-tout"
          className="inline-block px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors"
        >
          Voir les produits
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Panier</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item: any) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <div>
          <CartSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
