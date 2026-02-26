"use client"

import { useState } from "react"
import { sdk } from "@/lib/sdk"

const BENEFITS = [
  "Accès anticipé aux nouvelles collections et drops exclusifs",
  "Offres et promotions réservées aux abonnés",
  "Invitations aux événements en boutique",
  "Coulisses et actualités de la marque",
]

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError("")

    try {
      await sdk.client.fetch("/store/newsletter/subscribe", {
        method: "POST",
        body: { email },
      })
      setSuccess(true)
      setEmail("")
    } catch (err: any) {
      if (err?.status === 409) {
        setError("Cette adresse email est déjà inscrite.")
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <section className="py-16 md:py-24 text-center px-4">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">
          Restez informé
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Newsletter</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Inscrivez-vous pour ne rien manquer de l&apos;univers Ice Industry.
        </p>
      </section>

      <div className="max-w-lg mx-auto px-4 pb-20">
        {/* Benefits */}
        <div className="mb-10 space-y-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-foreground flex-shrink-0 mt-0.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <p className="text-sm text-muted-foreground">{benefit}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-md px-4 py-3 text-center">
            Merci ! Vous êtes maintenant inscrit à notre newsletter.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3">
                {error}
              </div>
            )}
            <input
              type="email"
              required
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
