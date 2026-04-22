/** Source of a Brevo contact interaction — used for tracking and analytics */
export enum NewsletterSource {
  Footer = "footer",
  NewsletterPage = "newsletter_page",
  Checkout = "checkout",
  Register = "register",
  Profile = "profile",
}

/** Payload sent to POST /api/newsletter */
export type NewsletterPayload = {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  birthDate?: string
  /** Add contact to the newsletter mailing list (requires explicit consent) */
  addToList?: boolean
  /** Where this contact interaction originated */
  source?: NewsletterSource
  /** Honeypot field — must be empty for legitimate submissions */
  honeypot?: string
}
