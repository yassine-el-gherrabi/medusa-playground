"use client"

import { useState } from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { useCart } from "@/providers/CartProvider"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/utils"
import CheckoutForm from "@/components/checkout/CheckoutForm"
import ShippingOptions from "@/components/checkout/ShippingOptions"
import StripePayment from "@/components/checkout/StripePayment"
import type { ShippingAddressData } from "@/schemas/checkout"
import type { Order, LineItem } from "@/types"

type Step = "address" | "shipping" | "payment" | "confirmation"

export default function CheckoutPage() {
  const { cart } = useCart()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>("address")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [order, setOrder] = useState<Order | null>(null)

  if (!cart || !cart.items?.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <Link
          href="/boutique"
          className="inline-block px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors"
        >
          Voir les produits
        </Link>
      </div>
    )
  }

  if (step === "confirmation" && order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-green-500 mx-auto"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Commande confirmée !</h1>
        <p className="text-muted-foreground mb-8">
          Merci pour votre commande. Numéro de commande :{" "}
          <span className="font-mono font-semibold text-foreground">
            {order.display_id || order.id}
          </span>
        </p>
        <Link
          href="/boutique"
          className="inline-block px-6 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    )
  }

  const handleAddressSubmit = async (data: {
    email: string
    shipping_address: ShippingAddressData
  }) => {
    setLoading(true)
    setError("")
    try {
      await sdk.store.cart.update(cart.id, {
        email: data.email,
        shipping_address: data.shipping_address,
      })
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      setStep("shipping")
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Impossible de sauvegarder l'adresse. Vérifiez vos informations."
      setError(msg)
      console.error("Failed to update address:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleShippingSelect = async (optionId: string, relayPointId?: string) => {
    setLoading(true)
    setError("")
    try {
      // If relay point selected, store its ID in shipping address metadata
      if (relayPointId && cart.shipping_address) {
        const existingMeta = (cart.shipping_address as unknown as { metadata?: Record<string, unknown> }).metadata || {}
        await sdk.store.cart.update(cart.id, {
          shipping_address: {
            ...cart.shipping_address,
            metadata: {
              ...existingMeta,
              relay_point_id: relayPointId,
            },
          },
        })
      }

      const shippingPayload: { option_id: string; data?: Record<string, unknown> } = {
        option_id: optionId,
      }
      if (relayPointId) {
        shippingPayload.data = { relay_point_id: relayPointId }
      }
      await sdk.store.cart.addShippingMethod(cart.id, shippingPayload)
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      setStep("payment")
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Impossible de définir le mode de livraison."
      setError(msg)
      console.error("Failed to set shipping:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderComplete = (completedOrder: Order) => {
    setOrder(completedOrder)
    localStorage.removeItem("cart_id")
    setStep("confirmation")
  }

  const steps: { key: Step; label: string }[] = [
    { key: "address", label: "Adresse" },
    { key: "shipping", label: "Livraison" },
    { key: "payment", label: "Paiement" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Commande</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s.key
                  ? "bg-black text-white"
                  : currentStepIndex > i
                    ? "bg-green-600 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStepIndex > i ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-8 sm:w-16 h-px bg-border mx-2" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === "address" && (
            <CheckoutForm onSubmit={handleAddressSubmit} loading={loading} />
          )}
          {step === "shipping" && (
            <ShippingOptions
              cartId={cart.id}
              currencyCode={cart.currency_code || "eur"}
              onSelect={handleShippingSelect}
              loading={loading}
            />
          )}
          {step === "payment" && (
            <StripePayment
              cartId={cart.id}
              onComplete={handleOrderComplete}
            />
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="bg-muted rounded-lg p-6 h-fit">
          <h3 className="font-semibold mb-4">Récapitulatif</h3>
          <div className="space-y-3">
            {cart.items?.map((item: LineItem) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product_title || item.title} x{item.quantity}
                </span>
                <span>
                  {formatPrice(
                    item.unit_price * item.quantity,
                    cart.currency_code || "eur"
                  )}
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>
                {formatPrice(cart.total || 0, cart.currency_code || "eur")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
