"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginData } from "@/schemas/auth"
import { login } from "@/lib/medusa/customer"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginData) {
    setError(null)
    try {
      await login(data.email, data.password)
      router.push("/account")
    } catch {
      setError("Email ou mot de passe incorrect.")
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-light tracking-wide text-center mb-8">
        Connexion
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs uppercase tracking-wider mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
          />
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background py-3 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-8">
        Pas encore de compte ?{" "}
        <Link href="/account/register" className="underline hover:text-foreground transition-colors">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
