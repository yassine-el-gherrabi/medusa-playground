/**
 * Cookie consent utilities — CNIL / RGPD compliant
 * Consent stored for 13 months max (CNIL recommendation)
 */

export type CookieCategory = "analytics" | "marketing" | "functional"

export type CookieConsent = {
  essential: true // always on
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp: number
}

const CONSENT_KEY = "ice_cookie_consent"
const THIRTEEN_MONTHS_MS = 13 * 30 * 24 * 60 * 60 * 1000

/** Read saved consent from cookie */
export function getConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_KEY}=`))
  if (!raw) return null
  try {
    const consent: CookieConsent = JSON.parse(
      decodeURIComponent(raw.split("=")[1])
    )
    // Expired after 13 months
    if (Date.now() - consent.timestamp > THIRTEEN_MONTHS_MS) {
      clearConsent()
      return null
    }
    return consent
  } catch {
    return null
  }
}

/** Save consent as a first-party cookie (13 months) */
export function saveConsent(consent: Omit<CookieConsent, "essential" | "timestamp">) {
  const full: CookieConsent = {
    essential: true,
    ...consent,
    timestamp: Date.now(),
  }
  const maxAge = Math.floor(THIRTEEN_MONTHS_MS / 1000)
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(
    JSON.stringify(full)
  )};path=/;max-age=${maxAge};SameSite=Lax`

  // Fire consent event for GTM / analytics
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    ;(window as any).dataLayer.push({
      event: "cookie_consent_update",
      cookie_consent: full,
    })
  }
}

/** Remove consent cookie */
export function clearConsent() {
  document.cookie = `${CONSENT_KEY}=;path=/;max-age=0`
}

/** Check if a specific category is allowed */
export function isCategoryAllowed(category: CookieCategory): boolean {
  const consent = getConsent()
  if (!consent) return false
  return consent[category]
}
