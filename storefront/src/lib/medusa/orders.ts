import { sdk } from "@/lib/sdk"
import type { Order } from "@/types"

export async function getOrders(): Promise<Order[]> {
  const { orders } = await sdk.store.order.list({ limit: 50 })
  return orders as Order[]
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const { order } = await sdk.store.order.retrieve(id)
    return order as Order
  } catch {
    return null
  }
}
