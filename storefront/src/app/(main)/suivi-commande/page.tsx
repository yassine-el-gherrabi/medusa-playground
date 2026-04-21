"use client"

import { useState, type FormEvent } from "react"

export default function SuiviCommandePage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Redirect to account orders or show tracking info
    setSubmitted(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light tracking-wide mb-4">
        Suivre ma commande
      </h1>
      <p
        className="text-sm leading-relaxed mb-10"
        style={{ color: "var(--color-muted)" }}
      >
        Renseignez votre numéro de commande et l&apos;adresse email utilisée
        lors de votre achat pour consulter le statut de votre livraison.
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label
              htmlFor="order"
              className="block text-xs uppercase tracking-[0.15em] font-medium mb-2"
            >
              Numéro de commande
            </label>
            <input
              id="order"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Ex : ICE-20260421-XXXXX"
              required
              className="w-full border px-4 py-3 text-sm bg-transparent focus:outline-none transition-colors"
              style={{
                borderColor: "var(--color-border)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-ink)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border)")
              }
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-[0.15em] font-medium mb-2"
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full border px-4 py-3 text-sm bg-transparent focus:outline-none transition-colors"
              style={{
                borderColor: "var(--color-border)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-ink)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border)")
              }
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 uppercase tracking-[0.18em] text-[11px] font-medium transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-surface)",
            }}
          >
            Rechercher
          </button>
        </form>
      ) : (
        <div
          className="p-6 text-sm leading-relaxed"
          style={{
            background: "var(--color-surface-warm)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="font-medium mb-2">Commande introuvable</p>
          <p style={{ color: "var(--color-muted)" }}>
            Aucune commande correspondante n&apos;a été trouvée. Vérifiez les
            informations saisies ou consultez votre{" "}
            <a href="/account" className="underline underline-offset-2">
              espace client
            </a>
            . Vous pouvez également contacter notre service client à{" "}
            <a
              href="mailto:contact@iceindustry.fr"
              className="underline underline-offset-2"
            >
              contact@iceindustry.fr
            </a>
            .
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setOrderNumber("")
              setEmail("")
            }}
            className="mt-4 text-xs uppercase tracking-[0.15em] underline underline-offset-2"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── Statuts expliqués ── */}
      <div className="mt-16">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">
          Comprendre le statut de votre commande
        </h2>
        <div className="space-y-4">
          {[
            {
              status: "Confirmée",
              description:
                "Votre commande a été reçue et le paiement validé. Elle sera préparée sous 1 à 2 jours ouvrés.",
            },
            {
              status: "En préparation",
              description:
                "Votre commande est en cours de préparation dans nos entrepôts à Marseille.",
            },
            {
              status: "Expédiée",
              description:
                "Votre colis a été remis au transporteur. Vous avez reçu un email avec le numéro de suivi.",
            },
            {
              status: "En cours de livraison",
              description:
                "Le transporteur est en possession de votre colis et la livraison est imminente.",
            },
            {
              status: "Livrée",
              description:
                "Votre commande a été livrée avec succès. Bonne découverte.",
            },
          ].map((item) => (
            <div
              key={item.status}
              className="flex gap-4 pb-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <span className="text-sm font-medium w-36 flex-shrink-0">
                {item.status}
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                {item.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
