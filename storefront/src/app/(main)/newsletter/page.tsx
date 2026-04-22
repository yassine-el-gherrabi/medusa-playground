"use client"

import { useState } from "react"
import { useNewsletter } from "@/hooks/useNewsletter"

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const { status, message, subscribe } = useNewsletter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    subscribe(email)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-light tracking-wide mb-4">Newsletter</h1>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        Inscrivez-vous pour recevoir en avant-première nos nouvelles collections,
        offres exclusives et actualités de la marque.
      </p>

      {status === "success" ? (
        <div className="py-8">
          <p className="text-sm font-medium">{message}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Vous recevrez bientôt nos dernières nouveautés.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            required
            disabled={status === "loading"}
            className="flex-1 border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-8 py-3 bg-foreground text-background text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
          >
            {status === "loading" ? "Inscription..." : "S\u2019inscrire"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-sm text-red-500 mt-3">{message}</p>
      )}
    </div>
  )
}
