"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NewsletterSource } from "@/types/newsletter"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterData } from "@/schemas/auth"
import { register as registerCustomer } from "@/lib/medusa/customer"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterData) {
    setError(null)
    try {
      await registerCustomer(data)

      // Sync profile data to Brevo (fire-and-forget, no list subscription)
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          addToList: false,
          source: NewsletterSource.Register,
        }),
      }).catch(() => {})

      router.push("/account")
    } catch {
      setError("Une erreur est survenue. Veuillez r\u00e9essayer.")
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-light tracking-wide text-center mb-8">
        Créer un compte
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-xs uppercase tracking-wider mb-2">
              Prénom
            </label>
            <input
              id="first_name"
              type="text"
              autoComplete="given-name"
              {...register("first_name")}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
            {errors.first_name && (
              <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="block text-xs uppercase tracking-wider mb-2">
              Nom
            </label>
            <input
              id="last_name"
              type="text"
              autoComplete="family-name"
              {...register("last_name")}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
            {errors.last_name && (
              <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>

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
            autoComplete="new-password"
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
          {isSubmitting ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-8">
        Déjà un compte ?{" "}
        <Link href="/account/login" className="underline hover:text-foreground transition-colors">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
