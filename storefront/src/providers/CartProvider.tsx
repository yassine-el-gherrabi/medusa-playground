"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "@/lib/sdk"
import { useRegion } from "./RegionProvider"
import type { Cart } from "@/types"

type CartContextType = {
  cart: Cart | null
  isLoading: boolean
  drawerOpen: boolean
  error: string
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (variantId: string, quantity?: number) => Promise<void>
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { regionId } = useRegion()
  const queryClient = useQueryClient()
  const [cartId, setCartId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("cart_id")
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [error, setError] = useState("")

  // Fetch cart — handle expired/invalid cart IDs gracefully
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: async () => {
      if (!cartId) return null
      try {
        const { cart } = await sdk.store.cart.retrieve(cartId)
        return cart as Cart
      } catch {
        // Cart expired or invalid — clear and start fresh
        localStorage.removeItem("cart_id")
        setCartId(null)
        return null
      }
    },
    enabled: !!cartId,
    staleTime: 1000 * 30, // 30s — optimistic updates keep UI fresh between refetches
  })

  // Create cart if needed — skip validation retrieve, let addItem fail and recover
  const ensureCart = useCallback(async (): Promise<string> => {
    if (cartId) return cartId

    const { cart } = await sdk.store.cart.create({ region_id: regionId })
    localStorage.setItem("cart_id", cart.id)
    setCartId(cart.id)
    return cart.id
  }, [cartId, regionId])

  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: ["cart"] })

  const addMutation = useMutation({
    mutationFn: async ({
      variantId,
      quantity,
    }: {
      variantId: string
      quantity: number
    }) => {
      setError("")
      const id = await ensureCart()
      await sdk.store.cart.createLineItem(id, {
        variant_id: variantId,
        quantity,
      })
    },
    onSuccess: () => {
      invalidateCart()
      setDrawerOpen(true)
    },
    onError: (err) => {
      // If cart was expired/invalid, clear it so next attempt creates a fresh one
      const msg = err instanceof Error ? err.message : ""
      if (msg.includes("not found") || msg.includes("404") || msg.includes("invalid")) {
        localStorage.removeItem("cart_id")
        setCartId(null)
      }
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'ajouter au panier."
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      lineItemId,
      quantity,
    }: {
      lineItemId: string
      quantity: number
    }) => {
      if (!cartId) return
      await sdk.store.cart.updateLineItem(cartId, lineItemId, { quantity })
    },
    onMutate: async ({ lineItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previous = queryClient.getQueryData<Cart>(["cart", cartId])
      if (previous) {
        queryClient.setQueryData<Cart>(["cart", cartId], {
          ...previous,
          items: previous.items?.map((item) =>
            item.id === lineItemId ? { ...item, quantity } : item
          ),
          subtotal: previous.items?.reduce((sum, item) =>
            sum + (item.id === lineItemId ? item.unit_price * quantity : item.unit_price * item.quantity), 0
          ) ?? previous.subtotal,
        })
      }
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart", cartId], context.previous)
      }
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier la quantité."
      )
    },
    onSettled: invalidateCart,
  })

  const removeMutation = useMutation({
    mutationFn: async (lineItemId: string) => {
      if (!cartId) return
      await sdk.store.cart.deleteLineItem(cartId, lineItemId)
    },
    onMutate: async (lineItemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previous = queryClient.getQueryData<Cart>(["cart", cartId])
      if (previous) {
        const filtered = previous.items?.filter((item) => item.id !== lineItemId)
        queryClient.setQueryData<Cart>(["cart", cartId], {
          ...previous,
          items: filtered,
          subtotal: filtered?.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) ?? 0,
        })
      }
      return { previous }
    },
    onError: (_err, _lineItemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart", cartId], context.previous)
      }
    },
    onSettled: invalidateCart,
  })

  return (
    <CartContext.Provider
      value={{
        cart: cart ?? null,
        isLoading,
        drawerOpen,
        error,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        addItem: (variantId, quantity = 1) =>
          addMutation.mutateAsync({ variantId, quantity }),
        updateItem: (lineItemId, quantity) =>
          updateMutation.mutateAsync({ lineItemId, quantity }),
        removeItem: (lineItemId) => removeMutation.mutateAsync(lineItemId),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
