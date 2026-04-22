import { NextRequest, NextResponse } from "next/server"

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = 2

type NewsletterBody = {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  birthDate?: string
  addToList?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: NewsletterBody = await req.json()
    const { email, firstName, lastName, phone, birthDate, addToList = true } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY not configured")
      return NextResponse.json(
        { error: "Service indisponible" },
        { status: 500 }
      )
    }

    // Build attributes — only include non-empty values
    const attributes: Record<string, string> = {}
    if (firstName) attributes.PRENOM = firstName
    if (lastName) attributes.NOM = lastName
    if (phone) attributes.SMS = phone
    if (birthDate) attributes.DATE_NAISSANCE = birthDate

    const payload: Record<string, unknown> = {
      email,
      updateEnabled: true,
    }

    if (Object.keys(attributes).length > 0) {
      payload.attributes = attributes
    }

    if (addToList) {
      payload.listIds = [BREVO_LIST_ID]
    }

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
      // "duplicate_parameter" means already subscribed — treat as success
      if (error.code === "duplicate_parameter") {
        return NextResponse.json({ success: true, already: true })
      }
      console.error("Brevo API error:", error)
      return NextResponse.json(
        { error: "Erreur lors de l'inscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Newsletter error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
