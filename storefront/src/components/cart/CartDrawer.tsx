"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/providers/cart"
import CartItem from "./CartItem"
import { formatPrice } from "@/lib/utils"

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer } = useCart()
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    closeDrawer()
  }, [pathname, closeDrawer])

  // Body scroll lock
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDrawerOpen])

  // Escape key
  useEffect(() => {
    if (!isDrawerOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isDrawerOpen, closeDrawer])

  const items = cart?.items || []
  const currencyCode = cart?.currency_code || "eur"
  const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] transition-colors duration-300 ${
          isDrawerOpen
            ? "bg-black/40 pointer-events-auto"
            : "bg-transparent pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Panier"
        aria-modal={isDrawerOpen}
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-[61] bg-white
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border flex-shrink-0">
            <h2 className="text-[11px] font-normal tracking-[0.15em] uppercase">
              Panier{itemCount > 0 && ` (${itemCount})`}
            </h2>
            <button
              onClick={closeDrawer}
              className="p-2 -mr-2 hover:opacity-70 transition-opacity"
              aria-label="Fermer le panier"
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
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <p className="text-sm text-muted-foreground mb-6">Votre panier est vide</p>
              <button
                onClick={closeDrawer}
                className="text-[11px] font-normal tracking-[0.15em] uppercase border-b border-current pb-0.5 hover:opacity-70 transition-opacity"
              >
                Continuer le shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6">
                {items.map((item: any) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-border px-6 py-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">
                    {formatPrice(cart?.subtotal || 0, currencyCode)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Frais de livraison calculés à l&apos;étape suivante
                </p>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="block w-full text-center py-3.5 bg-black text-white text-[11px] font-normal uppercase tracking-[0.15em] hover:bg-black/90 transition-colors"
                >
                  Passer la commande
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
