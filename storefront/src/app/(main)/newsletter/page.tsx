"use client"

import { useState } from "react"
import { useNewsletter } from "@/hooks/useNewsletter"
import { NewsletterSource } from "@/types/newsletter"

export default function NewsletterPage() {
  const [email, setEmail] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const { status, message, subscribe } = useNewsletter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    subscribe({ email, honeypot, source: NewsletterSource.NewsletterPage })
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
        <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3">
          {/* Honeypot — invisible to humans, attractive to bots */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
            style={{ position: "absolute", left: "-9999px" }}
          />
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
