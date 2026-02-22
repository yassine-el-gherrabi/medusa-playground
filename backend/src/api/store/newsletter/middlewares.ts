import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "zod"

export const SubscribeNewsletterSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
})

export type SubscribeNewsletterSchema = z.infer<typeof SubscribeNewsletterSchema>

export const newsletterMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/newsletter/subscribe",
    method: "POST",
    middlewares: [validateAndTransformBody(SubscribeNewsletterSchema)],
  },
]
