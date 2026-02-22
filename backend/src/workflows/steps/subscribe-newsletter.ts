import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { NEWSLETTER_MODULE } from "../../modules/newsletter"
import { MedusaError } from "@medusajs/framework/utils"

type SubscribeNewsletterInput = {
  email: string
  first_name?: string
}

export const subscribeNewsletterStep = createStep(
  "subscribe-newsletter",
  async (input: SubscribeNewsletterInput, { container }) => {
    const newsletterService = container.resolve(NEWSLETTER_MODULE)

    // Check for existing subscriber
    const [existing] = await newsletterService.listNewsletterSubscribers({
      email: input.email,
    })

    if (existing) {
      if (existing.is_active) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          "This email is already subscribed"
        )
      }
      // Reactivate inactive subscriber
      const updated = await newsletterService.updateNewsletterSubscribers({
        id: existing.id,
        is_active: true,
      })
      return new StepResponse(updated, existing.id)
    }

    const subscriber = await newsletterService.createNewsletterSubscribers({
      email: input.email,
      first_name: input.first_name || null,
    })

    return new StepResponse(subscriber, subscriber.id)
  },
  async (subscriberId, { container }) => {
    if (!subscriberId) return
    const newsletterService = container.resolve(NEWSLETTER_MODULE)
    await newsletterService.deleteNewsletterSubscribers(subscriberId)
  }
)
