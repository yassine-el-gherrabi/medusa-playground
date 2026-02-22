"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth"
import { sdk } from "@/lib/sdk"

export default function AccountProfilePage() {
  const { customer, setCustomer } = useAuth()
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState(customer?.first_name || "")
  const [lastName, setLastName] = useState(customer?.last_name || "")
  const [phone, setPhone] = useState(customer?.phone || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!customer) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const { customer: updated } = await sdk.store.customer.update({
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      setCustomer(updated as any)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to update profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Profil</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Modifier
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-md px-4 py-3 mb-6">
          Profil mis a jour avec succes.
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prenom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telephone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={customer.email} disabled className={inputClass} />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setFirstName(customer.first_name)
                setLastName(customer.last_name)
                setPhone(customer.phone || "")
              }}
              className="px-6 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Prenom</p>
              <p className="text-sm">{customer.first_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Nom</p>
              <p className="text-sm">{customer.last_name || "—"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm">{customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Telephone</p>
            <p className="text-sm">{customer.phone || "—"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
