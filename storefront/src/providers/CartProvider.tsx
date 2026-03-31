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

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: async () => {
      if (!cartId) return null
      const { cart } = await sdk.store.cart.retrieve(cartId)
      return cart as Cart
    },
    enabled: !!cartId,
    staleTime: 0,
  })

  // Create cart if needed
  const ensureCart = useCallback(async (): Promise<string> => {
    if (cartId) return cartId
    const { cart } = await sdk.store.cart.create({ region_id: regionId })
    localStorage.setItem("cart_id", cart.id)
    setCartId(cart.id)
    return cart.id
  }, [cartId, regionId])

  // Mutations
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
    onSuccess: invalidateCart,
  })

  const removeMutation = useMutation({
    mutationFn: async (lineItemId: string) => {
      if (!cartId) return
      await sdk.store.cart.deleteLineItem(cartId, lineItemId)
    },
    onSuccess: invalidateCart,
  })

  return (
    <CartContext.Provider
      value={{
        cart: cart ?? null,
        isLoading,
        drawerOpen,
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
