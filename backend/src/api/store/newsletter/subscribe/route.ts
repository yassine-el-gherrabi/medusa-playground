import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import subscribeNewsletterWorkflow from "../../../../workflows/subscribe-newsletter"
import { SubscribeNewsletterSchema } from "../middlewares"

export async function POST(
  req: MedusaRequest<SubscribeNewsletterSchema>,
  res: MedusaResponse
) {
  const { email, first_name } = req.validatedBody

  try {
    const { result } = await subscribeNewsletterWorkflow(req.scope).run({
      input: { email, first_name },
    })

    return res.status(201).json({ subscriber: result })
  } catch (error: any) {
    if (error.type === MedusaError.Types.DUPLICATE_ERROR) {
      return res.status(409).json({ message: error.message })
    }
    throw error
  }
}
