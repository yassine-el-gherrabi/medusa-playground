"use client"

import Image from "next/image"
import { useCart } from "@/providers/CartProvider"
import { formatPrice } from "@/lib/utils"

export default function CartItem({ item }: { item: any }) {
  const { updateItem, removeItem } = useCart()
  const thumbnail = item.thumbnail || item.variant?.product?.thumbnail

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {thumbnail ? (
          <Image src={thumbnail} alt={item.title} fill className="object-cover" sizes="96px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Pas d&apos;image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate">{item.product_title || item.title}</h3>
        {item.variant?.title && item.variant.title !== "Default" && (
          <p className="text-sm text-muted-foreground mt-0.5">{item.variant.title}</p>
        )}

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => {
              if (item.quantity <= 1) removeItem(item.id)
              else updateItem(item.id, item.quantity - 1)
            }}
            className="w-8 h-8 border border-border rounded flex items-center justify-center text-sm hover:bg-muted transition-colors min-w-[44px] min-h-[44px]"
          >
            -
          </button>
          <span className="text-sm w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => updateItem(item.id, item.quantity + 1)}
            className="w-8 h-8 border border-border rounded flex items-center justify-center text-sm hover:bg-muted transition-colors min-w-[44px] min-h-[44px]"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <p className="text-sm font-medium">
          {formatPrice(item.unit_price * item.quantity, item.currency_code || "eur")}
        </p>
        <button
          onClick={() => removeItem(item.id)}
          className="text-sm text-muted-foreground hover:text-red-500 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
