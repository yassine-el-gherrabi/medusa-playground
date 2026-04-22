"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { getCustomer, updateCustomer, logout } from "@/lib/medusa/customer"
import { Skeleton } from "@/components/ui/Skeleton"
import type { Customer } from "@/types"

type ProfileFormData = {
  first_name: string
  last_name: string
  phone: string
  birth_date: string
}

export default function AccountPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>()

  useEffect(() => {
    getCustomer()
      .then((c) => {
        if (!c) {
          router.replace("/account/login")
          return
        }
        setCustomer(c)
        const metadata = (c as Customer & { metadata?: Record<string, unknown> }).metadata
        reset({
          first_name: c.first_name || "",
          last_name: c.last_name || "",
          phone: c.phone || "",
          birth_date: (metadata?.birth_date as string) || "",
        })
      })
      .finally(() => setLoading(false))
  }, [router, reset])

  async function onSubmit(data: ProfileFormData) {
    try {
      const { birth_date, ...profileData } = data
      const existingMetadata = (customer as Customer & { metadata?: Record<string, unknown> })?.metadata || {}
      const updated = await updateCustomer({
        ...profileData,
        metadata: { ...existingMetadata, birth_date: birth_date || null },
      })
      setCustomer(updated)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      // Sync to Brevo (fire-and-forget, no list subscription)
      if (customer?.email) {
        fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customer.email,
            firstName: data.first_name || undefined,
            lastName: data.last_name || undefined,
            phone: data.phone || undefined,
            birthDate: birth_date || undefined,
            addToList: false,
            source: "profile",
          }),
        }).catch(() => {})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de mettre \u00e0 jour le profil.")
    }
  }

  async function handleLogout() {
    await logout()
    router.push("/account/login")
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" className="w-1/3 h-6" />
        <Skeleton variant="card" className="h-40" />
      </div>
    )
  }

  if (!customer) return null

  const metadata = (customer as Customer & { metadata?: Record<string, unknown> }).metadata
  const birthDate = (metadata?.birth_date as string) || ""

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Profil</h2>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Se d&eacute;connecter
        </button>
      </div>

      {success && (
        <p className="text-sm text-green-600 mb-4">Profil mis \u00e0 jour avec succ\u00e8s.</p>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {!editing ? (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-6 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Nom</p>
              <p className="text-sm mt-1">
                {customer.first_name} {customer.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="text-sm mt-1">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">T&eacute;l&eacute;phone</p>
              <p className="text-sm mt-1">{customer.phone || "Non renseign\u00e9"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Date de naissance</p>
              <p className="text-sm mt-1">
                {birthDate
                  ? new Date(birthDate).toLocaleDateString("fr-FR")
                  : "Non renseign\u00e9e"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2 border border-border text-sm hover:bg-muted transition-colors"
          >
            Modifier
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-xs uppercase tracking-wider mb-2">
                Pr&eacute;nom
              </label>
              <input
                id="first_name"
                type="text"
                {...register("first_name")}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-xs uppercase tracking-wider mb-2">
                Nom
              </label>
              <input
                id="last_name"
                type="text"
                {...register("last_name")}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs uppercase tracking-wider mb-2">
              T&eacute;l&eacute;phone
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div>
            <label htmlFor="birth_date" className="block text-xs uppercase tracking-wider mb-2">
              Date de naissance (optionnel)
            </label>
            <input
              id="birth_date"
              type="date"
              {...register("birth_date")}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-foreground text-background text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                reset({
                  first_name: customer.first_name || "",
                  last_name: customer.last_name || "",
                  phone: customer.phone || "",
                  birth_date: birthDate,
                })
              }}
              className="px-6 py-2 border border-border text-sm hover:bg-muted transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
