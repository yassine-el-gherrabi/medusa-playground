import { cookies } from "next/headers"
import { sdk } from "@/lib/sdk"
import type { Cart } from "@/types"

const CART_COOKIE = "cart_id"
const CART_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value
}

export async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, cartId, {
    maxAge: CART_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
}

export async function removeCartId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE)
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId()
  if (!cartId) return null

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId)
    return cart as Cart
  } catch {
    return null
  }
}

export async function createCart(regionId: string): Promise<Cart> {
  const { cart } = await sdk.store.cart.create({ region_id: regionId })
  await setCartId(cart.id)
  return cart as Cart
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<Cart> {
  const { cart } = await sdk.store.cart.createLineItem(cartId, {
    variant_id: variantId,
    quantity,
  })
  return cart as Cart
}

export async function updateCartItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<Cart> {
  const { cart } = await sdk.store.cart.updateLineItem(cartId, lineItemId, {
    quantity,
  })
  return cart as Cart
}

export async function removeCartItem(
  cartId: string,
  lineItemId: string
): Promise<Cart> {
  await sdk.store.cart.deleteLineItem(cartId, lineItemId)
  const { cart } = await sdk.store.cart.retrieve(cartId)
  return cart as Cart
}

export async function updateCart(
  cartId: string,
  data: Record<string, unknown>
): Promise<Cart> {
  const { cart } = await sdk.store.cart.update(cartId, data)
  return cart as Cart
}
