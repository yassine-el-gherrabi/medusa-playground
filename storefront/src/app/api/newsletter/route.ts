import { NextRequest, NextResponse } from "next/server"
import type { NewsletterPayload } from "@/types/newsletter"
import { isValidEmail, isDisposableEmail, checkRateLimit } from "@/lib/newsletter-security"

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = 2

export async function POST(req: NextRequest) {
  try {
    const body: NewsletterPayload = await req.json()
    const { email, firstName, lastName, phone, birthDate, addToList = true, source } = body

    // Layer 1 — Honeypot: silent success so bots think it worked
    if (body.honeypot) {
      return NextResponse.json({ success: true })
    }

    // Layer 3 — Rate limiting (checked before validation to block brute-force)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown"
    const rateCheck = checkRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques instants." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter) } }
      )
    }

    // Layer 4 — Strict email validation
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 })
    }

    // Layer 2 — Disposable email blocking
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: "Les adresses email temporaires ne sont pas acceptées" },
        { status: 400 }
      )
    }

    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY not configured")
      return NextResponse.json({ error: "Service indisponible" }, { status: 500 })
    }

    const attributes: Record<string, string> = {}
    if (firstName) attributes.PRENOM = firstName
    if (lastName) attributes.NOM = lastName
    if (phone) attributes.SMS = phone
    if (birthDate) attributes.DATE_NAISSANCE = birthDate
    if (source) attributes.SOURCE = source

    const payload: Record<string, unknown> = {
      email,
      updateEnabled: true,
    }

    if (Object.keys(attributes).length > 0) payload.attributes = attributes
    if (addToList) payload.listIds = [BREVO_LIST_ID]

    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!brevoRes.ok) {
      const error = await brevoRes.json().catch(() => ({}))
      if (error.code === "duplicate_parameter") {
        return NextResponse.json({ success: true, already: true })
      }
      console.error("Brevo API error:", error)
      return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Newsletter error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
