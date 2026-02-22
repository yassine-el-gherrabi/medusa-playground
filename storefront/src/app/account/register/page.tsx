"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/providers/auth"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !password) return
    setLoading(true)
    setError("")

    try {
      await register({ first_name: firstName, last_name: lastName, email, password })
      router.push("/account")
    } catch (err: any) {
      setError(err?.message || "Impossible de creer le compte. Veuillez reessayer.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-black"

  return (
    <div className="max-w-md mx-auto px-4 py-20 animate-fade-in">
      <h1 className="text-2xl font-bold text-center mb-2">Creer un compte</h1>
      <p className="text-muted-foreground text-center text-sm mb-8">
        Rejoignez la communaute Ice Industry.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prenom</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Creation..." : "Creer mon compte"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Deja un compte ?{" "}
        <Link href="/account/login" className="text-foreground underline hover:no-underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
