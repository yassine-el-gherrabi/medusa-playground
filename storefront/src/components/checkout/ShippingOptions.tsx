"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import { formatPrice } from "@/lib/utils"
import RelayPointSelector from "./RelayPointSelector"
import type { RelayPoint } from "./RelayPointSelector"

type ShippingOption = {
  id: string
  name: string
  amount: number | null
  data?: Record<string, unknown>
}

type ShippingOptionsProps = {
  cartId: string
  currencyCode: string
  onSelect: (optionId: string, relayPointId?: string) => void
  loading: boolean
}

function isRelayPointOption(option: ShippingOption): boolean {
  const name = option.name?.toLowerCase() || ""
  const dataId = (option.data?.id as string)?.toLowerCase() || ""
  return (
    name.includes("relais") ||
    name.includes("relay") ||
    name.includes("point relais") ||
    dataId.includes("relay-point") ||
    dataId === "colissimo-relay-point"
  )
}

function isPickupOption(option: ShippingOption): boolean {
  const name = option.name?.toLowerCase() || ""
  return (
    name.includes("pickup") ||
    name.includes("collect") ||
    name.includes("retrait") ||
    name.includes("boutique")
  )
}

function getOptionIcon(option: ShippingOption) {
  if (isPickupOption(option)) {
    return (
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
    )
  }

  if (isRelayPointOption(option)) {
    return (
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
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </svg>
    )
  }

  return null
}

export default function ShippingOptions({
  cartId,
  currencyCode,
  onSelect,
  loading,
}: ShippingOptionsProps) {
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [selectedRelayPoint, setSelectedRelayPoint] =
    useState<RelayPoint | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { shipping_options } =
          await sdk.store.fulfillment.listCartOptions({ cart_id: cartId })
        if (!cancelled) {
          setFetchError("")
          setOptions(
            (shipping_options || []).map((opt) => ({
              id: opt.id,
              name: opt.name,
              amount: (opt as unknown as Record<string, unknown>)
                .amount as number | null,
              data: (opt as unknown as Record<string, unknown>)
                .data as Record<string, unknown> | undefined,
            }))
          )
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les options de livraison."
          )
        }
      } finally {
        if (!cancelled) setFetching(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [cartId])

  const handleSelect = (optionId: string) => {
    setSelectedId(optionId)
    // Reset relay point when switching options
    const option = options.find((o) => o.id === optionId)
    if (!option || !isRelayPointOption(option)) {
      setSelectedRelayPoint(null)
    }
  }

  const handleRelayPointSelect = (point: RelayPoint) => {
    setSelectedRelayPoint(point)
  }

  const handleContinue = () => {
    if (!selectedId) return

    const option = options.find((o) => o.id === selectedId)
    if (option && isRelayPointOption(option)) {
      if (!selectedRelayPoint) return
      onSelect(selectedId, selectedRelayPoint.id)
    } else {
      onSelect(selectedId)
    }
  }

  const selectedOption = options.find((o) => o.id === selectedId)
  const needsRelayPoint =
    selectedOption && isRelayPointOption(selectedOption)
  const canContinue =
    selectedId && (!needsRelayPoint || selectedRelayPoint)

  if (fetching) {
    return (
      <div className="text-muted-foreground py-4">
        Chargement des options de livraison...
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3">
        {fetchError}
      </div>
    )
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
          const isPickup = isPickupOption(option)
          const isRelay = isRelayPointOption(option)
          const icon = getOptionIcon(option)

          return (
            <div key={option.id}>
              <label
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
                    {icon}
                    {option.name}
                  </p>
                  {isPickup && (
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <p>
                        Boutique Ice Industry &mdash; 13001 Marseille
                      </p>
                      <p>Prêt sous 24h</p>
                    </div>
                  )}
                  {isRelay && selectedId === option.id && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Sélectionnez un point relais ci-dessous
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {option.amount != null
                    ? option.amount === 0
                      ? "Gratuit"
                      : formatPrice(option.amount, currencyCode)
                    : "Calculé"}
                </span>
              </label>

              {/* Relay point selector inline */}
              {isRelay && selectedId === option.id && (
                <RelayPointSelector
                  onSelect={handleRelayPointSelect}
                  selectedPointId={selectedRelayPoint?.id}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Selected relay point summary */}
      {selectedRelayPoint && needsRelayPoint && (
        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 text-green-600 mt-0.5 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-green-800">
              {selectedRelayPoint.name}
            </p>
            <p className="text-green-700 text-xs">
              {selectedRelayPoint.address}, {selectedRelayPoint.zipCode}{" "}
              {selectedRelayPoint.city}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!canContinue || loading}
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors disabled:opacity-50 mt-4"
      >
        {loading ? "Enregistrement..." : "Continuer vers le paiement"}
      </button>
    </div>
  )
}
