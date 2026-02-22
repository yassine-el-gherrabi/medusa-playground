"use client"

import { useState } from "react"

type Address = {
  email: string
  first_name: string
  last_name: string
  address_1: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone: string
}

export default function CheckoutForm({
  onSubmit,
  loading,
}: {
  onSubmit: (data: { email: string; shipping_address: Omit<Address, "email"> }) => void
  loading: boolean
}) {
  const [form, setForm] = useState<Address>({
    email: "",
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "fr",
    phone: "",
  })
  const [error, setError] = useState("")

  const update = (field: keyof Address, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError("Veuillez entrer une adresse email valide.")
      return
    }
    if (!form.first_name || !form.last_name || !form.address_1 || !form.city || !form.postal_code) {
      setError("Veuillez remplir tous les champs obligatoires.")
      return
    }
    setError("")
    const { email, ...shipping_address } = form
    onSubmit({ email, shipping_address })
  }

  const inputClass =
    "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-black"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Adresse de livraison</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass}
        />
      </div>

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
          <label className="block text-sm font-medium mb-1">Region / Departement</label>
          <input
            type="text"
            value={form.province}
            onChange={(e) => update("province", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            <option value="dk">Danemark</option>
            <option value="se">Suede</option>
            <option value="es">Espagne</option>
            <option value="it">Italie</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Telephone (optionnel)</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-black/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Continuer vers la livraison"}
      </button>
    </form>
  )
}
