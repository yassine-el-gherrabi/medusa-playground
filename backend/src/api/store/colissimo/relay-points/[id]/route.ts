import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ColissimoPointRetraitClient } from "medusa-colissimo"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const zipCode = req.query.zipCode as string

    if (!id) {
      res.status(400).json({ error: "Relay point ID is required" })
      return
    }
    if (!zipCode) {
      res.status(400).json({ error: "zipCode query parameter is required" })
      return
    }

    const contractNumber = process.env.COLISSIMO_CONTRACT_NUMBER
    const password = process.env.COLISSIMO_PASSWORD

    if (!contractNumber || !password) {
      res.status(500).json({ error: "Colissimo credentials not configured" })
      return
    }

    const client = new ColissimoPointRetraitClient({ contractNumber, password })
    const point = await client.getRelayPoint(id, zipCode)

    if (!point) {
      res.status(404).json({ error: "Relay point not found" })
      return
    }

    res.json({ point })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ error: `Failed to get relay point: ${message}` })
  }
}
