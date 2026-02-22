"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/utils"
import { Skeleton } from "@/components/ui/Skeleton"

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  completed: "Terminee",
  archived: "Archivee",
  canceled: "Annulee",
  requires_action: "Action requise",
}

const FULFILLMENT_LABELS: Record<string, string> = {
  not_fulfilled: "Non expediee",
  fulfilled: "Expediee",
  partially_fulfilled: "Partiellement expediee",
  shipped: "En cours de livraison",
  delivered: "Livree",
  canceled: "Annulee",
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.order
      .retrieve(id)
      .then(({ order }) => setOrder(order))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-48" />
        <Skeleton variant="card" className="h-40" />
        <Skeleton variant="card" className="h-32" />
      </div>
    )
  }

  if (!order) {
    return <p className="text-muted-foreground">Commande introuvable.</p>
  }

  const currencyCode = order.currency_code || "eur"

  return (
    <div>
      <Link
        href="/account/orders"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
      >
        &larr; Retour aux commandes
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Commande #{order.display_id || order.id.slice(-8)}
        </h2>
        <span className="text-sm text-muted-foreground">
          {new Date(order.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Status */}
      <div className="flex gap-4 mb-8">
        <div className="px-3 py-1 bg-muted rounded text-xs">
          Statut : {STATUS_LABELS[order.status] || order.status}
        </div>
        {order.fulfillment_status && (
          <div className="px-3 py-1 bg-muted rounded text-xs">
            Expedition : {FULFILLMENT_LABELS[order.fulfillment_status] || order.fulfillment_status}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="border border-border rounded-lg divide-y divide-border mb-6">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="relative w-16 h-16 flex-shrink-0 rounded bg-muted overflow-hidden">
              {item.thumbnail ? (
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  —
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.product_title || item.title}</p>
              {item.variant?.title && item.variant.title !== "Default" && (
                <p className="text-xs text-muted-foreground">{item.variant.title}</p>
              )}
              <p className="text-xs text-muted-foreground">Quantite : {item.quantity}</p>
            </div>
            <p className="text-sm font-medium">
              {formatPrice(item.unit_price * item.quantity, currencyCode)}
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border border-border rounded-lg p-4 space-y-2 max-w-sm ml-auto">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span>{formatPrice(order.subtotal || 0, currencyCode)}</span>
        </div>
        {order.shipping_total > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Livraison</span>
            <span>{formatPrice(order.shipping_total, currencyCode)}</span>
          </div>
        )}
        {order.tax_total > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TVA</span>
            <span>{formatPrice(order.tax_total, currencyCode)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-sm border-t border-border pt-2">
          <span>Total</span>
          <span>{formatPrice(order.total || 0, currencyCode)}</span>
        </div>
      </div>

      {/* Shipping address */}
      {order.shipping_address && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Adresse de livraison</h3>
          <div className="text-sm text-muted-foreground">
            <p>
              {order.shipping_address.first_name} {order.shipping_address.last_name}
            </p>
            <p>{order.shipping_address.address_1}</p>
            <p>
              {order.shipping_address.postal_code} {order.shipping_address.city}
            </p>
            <p>{order.shipping_address.country_code?.toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  )
}
