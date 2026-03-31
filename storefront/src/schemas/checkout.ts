import { z } from "zod"

export const shippingAddressSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  address_1: z.string().min(1, "L'adresse est requise"),
  address_2: z.string().optional(),
  city: z.string().min(1, "La ville est requise"),
  postal_code: z.string().min(1, "Le code postal est requis"),
  country_code: z.string().length(2, "Sélectionnez un pays"),
  phone: z.string().optional(),
})

export type ShippingAddressData = z.infer<typeof shippingAddressSchema>

export const contactSchema = z.object({
  email: z.string().email("Adresse email invalide"),
})

export type ContactData = z.infer<typeof contactSchema>
