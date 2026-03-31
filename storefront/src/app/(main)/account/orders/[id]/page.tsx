"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getOrder } from "@/lib/medusa/orders"
import { formatPrice } from "@/lib/utils"
import { Skeleton } from "@/components/ui/Skeleton"
import type { Order } from "@/types"

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  completed: "Terminée",
  archived: "Archivée",
  canceled: "Annulée",
  requires_action: "Action requise",
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" className="w-1/3 h-6" />
        <Skeleton variant="card" className="h-60" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Commande introuvable.</p>
        <Link
          href="/account/orders"
          className="inline-block px-6 py-2 border border-border text-sm hover:bg-muted transition-colors"
        >
          Retour aux commandes
        </Link>
      </div>
    )
  }

  const currency = order.currency_code || "eur"

  return (
    <div>
      <Link
        href="/account/orders"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
      >
        &larr; Retour aux commandes
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">
          Commande #{order.display_id || order.id.slice(-8)}
        </h2>
        <span className="text-sm text-muted-foreground">
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="space-y-6">
        {/* Items */}
        <div className="border border-border rounded-lg divide-y divide-border">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              {item.thumbnail && (
                <div className="w-16 h-16 relative shrink-0 bg-muted rounded">
                  <Image
                    src={item.thumbnail}
                    alt={item.product_title || ""}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.product_title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.variant_title} &middot; Qté: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium shrink-0">
                {formatPrice(item.total, currency)}
              </p>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Adresse de livraison
            </p>
            <p className="text-sm">
              {order.shipping_address.first_name} {order.shipping_address.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shipping_address.address_1}
              {order.shipping_address.address_2 && `, ${order.shipping_address.address_2}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shipping_address.postal_code} {order.shipping_address.city}
              {order.shipping_address.country_code &&
                `, ${order.shipping_address.country_code.toUpperCase()}`}
            </p>
          </div>
        )}

        {/* Totals */}
        <div className="border border-border rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span>{formatPrice(order.subtotal, currency)}</span>
          </div>
          {order.shipping_total != null && order.shipping_total > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              <span>{formatPrice(order.shipping_total, currency)}</span>
            </div>
          )}
          {order.tax_total != null && order.tax_total > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes</span>
              <span>{formatPrice(order.tax_total, currency)}</span>
            </div>
          )}
          {order.discount_total != null && order.discount_total > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Réduction</span>
              <span>-{formatPrice(order.discount_total, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(order.total, currency)}</span>
          </div>
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground">
          Passée le{" "}
          {new Date(order.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  )
}
