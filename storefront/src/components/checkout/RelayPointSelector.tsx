"use client"

import { useState, useCallback } from "react"

type RelayPoint = {
  id: string
  name: string
  address: string
  address2?: string
  zipCode: string
  city: string
  country: string
  type: string
  distance?: number
  lat?: string
  lng?: string
  openingHours: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
}

type RelayPointSelectorProps = {
  onSelect: (point: RelayPoint) => void
  selectedPointId?: string
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const DAYS_FR: Record<string, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
}

export default function RelayPointSelector({
  onSelect,
  selectedPointId,
}: RelayPointSelectorProps) {
  const [zipCode, setZipCode] = useState("")
  const [city, setCity] = useState("")
  const [points, setPoints] = useState<RelayPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const searchPoints = useCallback(async () => {
    if (!zipCode || !city) {
      setError("Veuillez renseigner le code postal et la ville.")
      return
    }

    setLoading(true)
    setError("")
    setSearched(true)

    try {
      const res = await fetch(`${BACKEND_URL}/store/colissimo/relay-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode, city, countryCode: "FR" }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          data.error || "Impossible de rechercher les points relais."
        )
      }

      const data = await res.json()
      setPoints(data.points || [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la recherche des points relais."
      )
    } finally {
      setLoading(false)
    }
  }, [zipCode, city])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchPoints()
    }
  }

  return (
    <div className="mt-4 border border-border rounded-md p-4 bg-white">
      <h3 className="text-sm font-semibold mb-3">
        Rechercher un point relais
      </h3>

      {/* Search form */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Code postal"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={5}
          className="flex-[2] px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
        <input
          type="text"
          placeholder="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-[3] px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
        <button
          onClick={searchPoints}
          disabled={loading}
          className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 rounded"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Rechercher"
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-xs mb-2">{error}</p>
      )}

      {/* Results */}
      {searched && !loading && points.length === 0 && !error && (
        <p className="text-muted-foreground text-sm py-4 text-center">
          Aucun point relais trouvé. Essayez un autre code postal.
        </p>
      )}

      {points.length > 0 && (
        <div className="max-h-72 overflow-y-auto space-y-1">
          {points.map((point) => {
            const isSelected = selectedPointId === point.id
            const isExpanded = expandedId === point.id

            return (
              <div key={point.id}>
                <button
                  onClick={() => onSelect(point)}
                  className={`w-full text-left p-3 rounded transition-colors ${
                    isSelected
                      ? "bg-black text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {point.name}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isSelected
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {point.address}, {point.zipCode} {point.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {point.distance != null && (
                        <span
                          className={`text-xs ${
                            isSelected
                              ? "text-white/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {point.distance < 1000
                            ? `${point.distance}m`
                            : `${(point.distance / 1000).toFixed(1)}km`}
                        </span>
                      )}
                      {isSelected && (
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
                      )}
                    </div>
                  </div>
                </button>

                {/* Opening hours toggle */}
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedId(isExpanded ? null : point.id)
                    }}
                    className="w-full text-left px-3 pb-2 text-xs text-white/70 underline"
                  >
                    {isExpanded ? "Masquer les horaires" : "Voir les horaires"}
                  </button>
                )}

                {isExpanded && isSelected && (
                  <div className="px-3 pb-3 bg-black text-white rounded-b">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                      {Object.entries(DAYS_FR).map(([key, label]) => {
                        const hours =
                          point.openingHours[
                            key as keyof typeof point.openingHours
                          ]
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-white/70">{label}</span>
                            <span>{hours || "Fermé"}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export type { RelayPoint }
