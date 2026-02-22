"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth"
import { sdk } from "@/lib/sdk"

export default function AddressesPage() {
  const { customer, setCustomer } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "fr",
    phone: "",
  })

  if (!customer) return null

  const addresses = customer.addresses || []

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { customer: updated } = await sdk.store.customer.createAddress(form)
      setCustomer(updated as any)
      setShowForm(false)
      setForm({
        first_name: "",
        last_name: "",
        address_1: "",
        city: "",
        province: "",
        postal_code: "",
        country_code: "fr",
        phone: "",
      })
    } catch (err) {
      console.error("Failed to add address:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    try {
      const { customer: updated } = await sdk.store.customer.deleteAddress(addressId)
      setCustomer(updated as any)
    } catch (err) {
      console.error("Failed to delete address:", err)
    }
  }

  const inputClass =
    "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-black"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Adresses</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            + Ajouter
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-4 max-w-md mb-8 pb-8 border-b border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prenom</label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              type="text"
              required
              value={form.address_1}
              onChange={(e) => update("address_1", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code postal</label>
              <input
                type="text"
                required
                value={form.postal_code}
                onChange={(e) => update("postal_code", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pays</label>
              <select
                value={form.country_code}
                onChange={(e) => update("country_code", e.target.value)}
                className={inputClass}
              >
                <option value="fr">France</option>
                <option value="de">Allemagne</option>
                <option value="gb">Royaume-Uni</option>
                <option value="es">Espagne</option>
                <option value="it">Italie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telephone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Ajouter l'adresse"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm">Aucune adresse enregistree.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="border border-border rounded-lg p-4">
              <p className="text-sm font-medium">
                {addr.first_name} {addr.last_name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{addr.address_1}</p>
              <p className="text-sm text-muted-foreground">
                {addr.postal_code} {addr.city}
              </p>
              <p className="text-sm text-muted-foreground">
                {addr.country_code?.toUpperCase()}
              </p>
              {addr.phone && (
                <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>
              )}
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-xs text-muted-foreground hover:text-red-400 transition-colors mt-3"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
