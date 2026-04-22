"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  shippingAddressSchema,
  contactSchema,
  type ShippingAddressData,
} from "@/schemas/checkout"

const checkoutFormSchema = contactSchema.merge(shippingAddressSchema)

type CheckoutFormData = z.infer<typeof checkoutFormSchema>

type CheckoutFormProps = {
  onSubmit: (data: {
    email: string
    shipping_address: ShippingAddressData
  }) => void
  loading: boolean
}

export default function CheckoutForm({ onSubmit, loading }: CheckoutFormProps) {
  const [newsletterOptIn, setNewsletterOptIn] = useState(false) // RGPD: must be unchecked by default

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      address_1: "",
      address_2: "",
      city: "",
      postal_code: "",
      country_code: "fr",
      phone: "",
    },
  })

  const onValid = (data: CheckoutFormData) => {
    const { email, ...shipping_address } = data

    // Fire-and-forget newsletter subscription if opted in
    if (newsletterOptIn && email) {
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: shipping_address.first_name || undefined,
          lastName: shipping_address.last_name || undefined,
          phone: shipping_address.phone || undefined,
          source: "checkout",
        }),
      }).catch(() => {
        // Newsletter subscription is non-blocking
      })
    }

    onSubmit({ email, shipping_address })
  }

  const inputClass =
    "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-black"

  const errorClass = "text-red-500 text-xs mt-1"

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Adresse de livraison</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          {...register("email")}
          className={inputClass}
          placeholder="votre@email.com"
        />
        {errors.email && (
          <p className={errorClass}>{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <input
            type="text"
            {...register("first_name")}
            className={inputClass}
          />
          {errors.first_name && (
            <p className={errorClass}>{errors.first_name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            {...register("last_name")}
            className={inputClass}
          />
          {errors.last_name && (
            <p className={errorClass}>{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Adresse</label>
        <input
          type="text"
          {...register("address_1")}
          className={inputClass}
        />
        {errors.address_1 && (
          <p className={errorClass}>{errors.address_1.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Complément d&apos;adresse (optionnel)
        </label>
        <input
          type="text"
          {...register("address_2")}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ville</label>
          <input
            type="text"
            {...register("city")}
            className={inputClass}
          />
          {errors.city && (
            <p className={errorClass}>{errors.city.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Code postal</label>
          <input
            type="text"
            {...register("postal_code")}
            className={inputClass}
          />
          {errors.postal_code && (
            <p className={errorClass}>{errors.postal_code.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pays</label>
          <select {...register("country_code")} className={inputClass}>
            <option value="fr">France</option>
            <option value="de">Allemagne</option>
            <option value="gb">Royaume-Uni</option>
            <option value="dk">Danemark</option>
            <option value="se">Suède</option>
            <option value="es">Espagne</option>
            <option value="it">Italie</option>
          </select>
          {errors.country_code && (
            <p className={errorClass}>{errors.country_code.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Téléphone (optionnel)
          </label>
          <input
            type="tel"
            {...register("phone")}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={newsletterOptIn}
          onChange={(e) => setNewsletterOptIn(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-black focus:ring-black accent-black"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          Recevoir nos nouvelles collections et offres exclusives
        </span>
      </label>

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
