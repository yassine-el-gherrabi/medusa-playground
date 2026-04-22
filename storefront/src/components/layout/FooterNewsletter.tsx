"use client"

import { useState } from "react"
import { useNewsletter } from "@/hooks/useNewsletter"

export default function FooterNewsletter() {
  const [email, setEmail] = useState("")
  const { status, message, subscribe } = useNewsletter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    subscribe({ email, source: "footer" })
  }

  if (status === "success") {
    return (
      <p className="text-xs text-black/70 font-medium">{message}</p>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          required
          disabled={status === "loading"}
          className="flex-1 min-w-0 bg-transparent border border-black/20 px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider hover:bg-black/85 transition-colors shrink-0 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "OK"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-500 mt-2">{message}</p>
      )}
    </div>
  )
}
