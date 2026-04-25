import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ColissimoPointRetraitClient } from "medusa-colissimo"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { address, zipCode, city, countryCode = "FR", weight } = req.body as {
      address?: string
      zipCode: string
      city: string
      countryCode?: string
      weight?: number
    }

    if (!zipCode) {
      res.status(400).json({ error: "zipCode is required" })
      return
    }
    if (!city) {
      res.status(400).json({ error: "city is required" })
      return
    }

    const contractNumber = process.env.COLISSIMO_CONTRACT_NUMBER
    const password = process.env.COLISSIMO_PASSWORD

    if (!contractNumber || !password) {
      res.status(500).json({ error: "Colissimo credentials not configured" })
      return
    }

    const client = new ColissimoPointRetraitClient({ contractNumber, password })
    const points = await client.searchRelayPoints({
      address,
      zipCode,
      city,
      countryCode,
      weight,
    })

    res.json({ points })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ error: `Failed to search relay points: ${message}` })
  }
}
