import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import { formatPrice } from "@/lib/utils"

export default function FreeShippingBar({
  subtotal,
  currencyCode = "eur",
}: {
  subtotal: number
  currencyCode?: string
}) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD)
  const achieved = remaining <= 0

  return (
    <div className="py-4">
      {/* Progress bar — thin, elegant */}
      <div className="h-[2px] bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground transition-all duration-500 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Message */}
      <p className="text-[11px] text-muted-foreground mt-2 tracking-[0.02em]">
        {achieved
          ? "Livraison offerte"
          : `Plus que ${formatPrice(remaining, currencyCode)} pour la livraison offerte`}
      </p>
    </div>
  )
}
