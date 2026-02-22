"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/utils"

export default function ShippingOptions({
  cartId,
  currencyCode,
  onSelect,
  loading,
}: {
  cartId: string
  currencyCode: string
  onSelect: (optionId: string) => void
  loading: boolean
}) {
  const [options, setOptions] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    sdk.store.fulfillment
      .listCartOptions({ cart_id: cartId })
      .then(({ shipping_options }) => {
        setOptions(shipping_options || [])
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [cartId])

  const handleSelect = (optionId: string) => {
    setSelectedId(optionId)
  }

  if (fetching) {
    return <div className="text-muted-foreground py-4">Chargement des options de livraison...</div>
  }

  if (options.length === 0) {
    return (
      <div className="text-muted-foreground py-4">
        Aucune option de livraison disponible pour votre adresse.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Mode de livraison</h2>

      <div className="space-y-2">
        {options.map((option) => {
          const isPickup =
            option.name?.toLowerCase().includes("pickup") ||
            option.name?.toLowerCase().includes("collect") ||
            option.name?.toLowerCase().includes("retrait") ||
            option.name?.toLowerCase().includes("boutique")

          return (
            <label
              key={option.id}
              className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-colors ${
                selectedId === option.id
                  ? "border-black bg-muted"
                  : "border-border hover:border-foreground/50"
              }`}
            >
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedId === option.id}
                onChange={() => handleSelect(option.id)}
                className="w-4 h-4 accent-black"
              />
              <div className="flex-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  {isPickup && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                      />
                    </svg>
                  )}
                  {option.name}
                </p>
                {isPickup && (
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <p>Boutique Ice Industry — 13001 Marseille</p>
                    <p>Pret sous 24h</p>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">
                {option.amount != null
                  ? option.amount === 0
                    ? "Gratuit"
                    : formatPrice(option.amount, currencyCode)
                  : "Calcule"}
              </span>
            </label>
          )
        })}
      </div>

      <button
        onClick={() => selectedId && onSelect(selectedId)}
        disabled={!selectedId || loading}
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors disabled:opacity-50 mt-4"
      >
        {loading ? "Enregistrement..." : "Continuer vers le paiement"}
      </button>
    </div>
  )
}
