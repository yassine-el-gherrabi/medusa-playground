import Link from "next/link"
import { formatPrice } from "@/lib/utils"

export default function CartSummary({ cart }: { cart: any }) {
  const currencyCode = cart.currency_code || "eur"

  return (
    <div className="bg-muted rounded-lg p-6 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Sous-total</span>
        <span>{formatPrice(cart.subtotal || 0, currencyCode)}</span>
      </div>
      {cart.tax_total > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">TVA</span>
          <span>{formatPrice(cart.tax_total, currencyCode)}</span>
        </div>
      )}
      {cart.shipping_total > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span>{formatPrice(cart.shipping_total, currencyCode)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-base border-t border-border pt-3">
        <span>Total</span>
        <span>{formatPrice(cart.total || 0, currencyCode)}</span>
      </div>
      <Link
        href="/checkout"
        className="block w-full text-center py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors mt-4"
      >
        Passer la commande
      </Link>
    </div>
  )
}
