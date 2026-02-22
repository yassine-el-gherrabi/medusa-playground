"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.order
      .list()
      .then(({ orders }) => setOrders(orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-6">Commandes</h2>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" className="h-20" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Commandes</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Aucune commande pour le moment.</p>
          <Link
            href="/voir-tout"
            className="inline-block px-6 py-2 border border-border text-sm hover:bg-muted transition-colors"
          >
            Decouvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">
                  Commande #{order.display_id || order.id.slice(-8)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatPrice(order.total, order.currency_code || "eur")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {STATUS_LABELS[order.status] || order.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
