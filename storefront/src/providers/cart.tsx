"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { sdk } from "@/lib/sdk"
import { useRegion } from "./region"

type Cart = any

type CartContextType = {
  cart: Cart | null
  loading: boolean
  addItem: (variantId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: true,
  addItem: async () => {},
  removeItem: async () => {},
  updateItem: async () => {},
  refreshCart: async () => {},
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const { region } = useRegion()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const refreshCart = useCallback(async () => {
    const cartId = localStorage.getItem("cart_id")
    if (!cartId) return
    try {
      const { cart } = await sdk.store.cart.retrieve(cartId)
      setCart(cart)
    } catch {
      localStorage.removeItem("cart_id")
      setCart(null)
    }
  }, [])

  useEffect(() => {
    if (!region) return

    const cartId = localStorage.getItem("cart_id")
    if (cartId) {
      sdk.store.cart.retrieve(cartId)
        .then(({ cart }) => setCart(cart))
        .catch(() => {
          localStorage.removeItem("cart_id")
          return sdk.store.cart.create({ region_id: region.id })
            .then(({ cart }) => {
              localStorage.setItem("cart_id", cart.id)
              setCart(cart)
            })
        })
        .finally(() => setLoading(false))
    } else {
      sdk.store.cart.create({ region_id: region.id })
        .then(({ cart }) => {
          localStorage.setItem("cart_id", cart.id)
          setCart(cart)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [region])

  const addItem = useCallback(async (variantId: string, quantity: number) => {
    const cartId = localStorage.getItem("cart_id")
    if (!cartId) return
    const { cart } = await sdk.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    })
    setCart(cart)
    setIsDrawerOpen(true)
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    const cartId = localStorage.getItem("cart_id")
    if (!cartId) return
    const { parent: cart } = await sdk.store.cart.deleteLineItem(cartId, itemId)
    setCart(cart)
  }, [])

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const cartId = localStorage.getItem("cart_id")
    if (!cartId) return
    const { cart } = await sdk.store.cart.updateLineItem(cartId, itemId, {
      quantity,
    })
    setCart(cart)
  }, [])

  return (
    <CartContext.Provider value={{ cart, loading, addItem, removeItem, updateItem, refreshCart, isDrawerOpen, openDrawer, closeDrawer }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
