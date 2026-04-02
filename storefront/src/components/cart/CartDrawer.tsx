"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/providers/CartProvider"
import CartItem from "./CartItem"
import FreeShippingBar from "./FreeShippingBar"
import CartCrossSell from "./CartCrossSell"
import { formatPrice } from "@/lib/utils"

export default function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, error } = useCart()
  const pathname = usePathname()

  // Close on route change (not on initial render)
  const prevPathname = useRef(pathname)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      closeDrawer()
    }
  }, [pathname, closeDrawer])

  // Body scroll lock
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [drawerOpen])

  // Escape key
  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [drawerOpen, closeDrawer])

  const items = cart?.items || []
  const currencyCode = cart?.currency_code || "eur"
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart?.subtotal || 0

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] transition-colors duration-300 ${
          drawerOpen ? "bg-black/50 pointer-events-auto" : "bg-transparent pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Panier"
        aria-modal={drawerOpen}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-[61] bg-white flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
          <h2 className="text-[11px] font-medium tracking-[0.15em] uppercase">
            Votre panier{itemCount > 0 ? ` (${itemCount})` : ""}
          </h2>
          <button
            onClick={closeDrawer}
            className="p-2 -mr-2 hover:opacity-70 transition-opacity cursor-pointer"
            aria-label="Fermer le panier"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <p className="text-sm text-muted-foreground mb-6">Votre panier est vide</p>
            <button
              onClick={closeDrawer}
              className="text-[11px] font-medium tracking-[0.12em] uppercase cursor-pointer group relative"
            >
              <span className="relative">
                Continuer le shopping
                <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current origin-right transition-transform duration-300 group-hover:scale-x-0" />
                <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current scale-x-0 origin-left transition-transform duration-300 delay-200 group-hover:scale-x-100" />
              </span>
            </button>
          </div>
        ) : (
          <>
            {/* ── Items ── */}
            <div className="flex-1 overflow-y-auto px-6">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] rounded px-3 py-2 mt-3">
                  {error}
                </div>
              )}

              {items.map((item) => (
                <CartItem key={item.id} item={item} currencyCode={currencyCode} />
              ))}
            </div>

            {/* ── Footer ── */}
            <div className="shrink-0 px-6 pb-6">
              {/* Free shipping bar */}
              <FreeShippingBar subtotal={subtotal} currencyCode={currencyCode} />

              {/* Subtotal */}
              <div className="flex justify-between text-sm py-3">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium">{formatPrice(subtotal, currencyCode)}</span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="block w-full text-center py-3.5 bg-foreground text-background text-[11px] font-medium uppercase tracking-[0.15em] hover:bg-foreground/90 transition-colors"
              >
                Paiement
              </Link>

              {/* Cross-sell — "Complétez le look" */}
              <CartCrossSell cartItems={items} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
