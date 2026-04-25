import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ColissimoPointRetraitClient } from "medusa-colissimo"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const contractNumber = process.env.COLISSIMO_CONTRACT_NUMBER
    const password = process.env.COLISSIMO_PASSWORD

    if (!contractNumber || !password) {
      res.status(500).json({ error: "Colissimo credentials not configured" })
      return
    }

    const client = new ColissimoPointRetraitClient({ contractNumber, password })
    const token = await client.generateWidgetToken()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    res.json({ token, expiresAt })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ error: `Failed to generate widget token: ${message}` })
  }
}
