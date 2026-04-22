"use client"

import { useState, useCallback } from "react"

export type SubscribeData = {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  birthDate?: string
}

export function useNewsletter() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState("")

  const subscribe = useCallback(async (data: SubscribeData | string) => {
    setStatus("loading")
    setMessage("")

    // Backward compat: accept plain email string
    const body: SubscribeData =
      typeof data === "string" ? { email: data } : data

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(
          result.already
            ? "Vous \u00eates d\u00e9j\u00e0 inscrit !"
            : "Merci pour votre inscription !"
        )
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
