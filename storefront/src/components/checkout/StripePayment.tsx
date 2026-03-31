"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { sdk } from "@/lib/sdk"
import type { Order } from "@/types"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
)

type PaymentFormProps = {
  cartId: string
  onComplete: (order: Order) => void
}

function PaymentForm({ cartId, onComplete }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError("")

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || "Le paiement a echoue")
        setLoading(false)
        return
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })

      if (confirmError) {
        setError(confirmError.message || "Le paiement a echoue")
        setLoading(false)
        return
      }

      const result = await sdk.store.cart.complete(cartId)
      if (result.type === "order") {
        onComplete(result.order as Order)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Paiement</h2>
      <PaymentElement />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Traitement en cours..." : "Confirmer la commande"}
      </button>
    </form>
  )
}

type StripePaymentProps = {
  cartId: string
  onComplete: (order: Order) => void
}

export default function StripePayment({
  cartId,
  onComplete,
}: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.payment
      .initiatePaymentSession(
        { id: cartId } as Parameters<
          typeof sdk.store.payment.initiatePaymentSession
        >[0],
        { provider_id: "pp_stripe_stripe" }
      )
      .then((res) => {
        const collection = res.payment_collection as
          | {
              payment_sessions?: Array<{
                provider_id: string
                data?: { client_secret?: string }
              }>
            }
          | undefined
        const session = collection?.payment_sessions?.find(
          (s) => s.provider_id === "pp_stripe_stripe"
        )
        if (session?.data?.client_secret) {
          setClientSecret(session.data.client_secret)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [cartId])

  if (loading) {
    return (
      <div className="text-muted-foreground py-4">
        Chargement du paiement...
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Paiement</h2>
        <p className="text-muted-foreground">
          Le paiement n&apos;est pas configur&eacute;. Veuillez configurer
          Stripe dans l&apos;administration Medusa.
        </p>
        <button
          onClick={async () => {
            try {
              const result = await sdk.store.cart.complete(cartId)
              if (result.type === "order") {
                onComplete(result.order as Order)
              }
            } catch (err) {
              console.error(err)
            }
          }}
          className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors"
        >
          Passer la commande (sans paiement)
        </button>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#000000",
            colorBackground: "#ffffff",
            colorText: "#000000",
            colorDanger: "#dc2626",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "6px",
          },
        },
      }}
    >
      <PaymentForm cartId={cartId} onComplete={onComplete} />
    </Elements>
  )
}
