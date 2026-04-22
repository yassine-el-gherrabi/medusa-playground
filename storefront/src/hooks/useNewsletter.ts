"use client"

import { useState, useCallback } from "react"
import type { NewsletterPayload } from "@/types/newsletter"

export function useNewsletter() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const subscribe = useCallback(async (data: NewsletterPayload) => {
    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(result.already ? "Vous êtes déjà inscrit !" : "Merci pour votre inscription !")
      } else {
        setStatus("error")
        setMessage(result.error || "Une erreur est survenue")
      }
    } catch {
      setStatus("error")
      setMessage("Erreur de connexion")
    }
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setMessage("")
  }, [])

  return { status, message, subscribe, reset }
}
