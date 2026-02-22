import { model } from "@medusajs/framework/utils"

const NewsletterSubscriber = model.define("newsletter_subscriber", {
  id: model.id().primaryKey(),
  email: model.text().unique(),
  first_name: model.text().nullable(),
  subscribed_at: model.dateTime(),
  is_active: model.boolean().default(true),
})

export default NewsletterSubscriber
