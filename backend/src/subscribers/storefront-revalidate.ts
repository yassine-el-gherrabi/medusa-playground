import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

/**
 * Sends a revalidation request to the Next.js storefront when
 * products or collections change in Medusa. This purges the
 * tag-based cache so visitors see fresh data without waiting
 * for the revalidate interval to expire.
 */

async function revalidateStorefront(tag: string, container: any) {
  const storefrontUrl = process.env.STOREFRONT_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!storefrontUrl || !secret) return

  const logger = container.resolve("logger")

  try {
    const res = await fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tag }),
    })

    if (res.ok) {
      logger.info(`Storefront cache revalidated: ${tag}`)
    } else {
      logger.warn(`Storefront revalidation failed (${res.status}): ${tag}`)
    }
  } catch (e) {
    logger.warn(`Storefront revalidation error: ${e}`)
  }
}

// Products
export const productHandler = async ({ container }: SubscriberArgs<{ id: string }>) => {
  await revalidateStorefront("products", container)
}

productHandler.config = {
  event: ["product.created", "product.updated", "product.deleted"],
} satisfies SubscriberConfig

// Collections
export const collectionHandler = async ({ container }: SubscriberArgs<{ id: string }>) => {
  await revalidateStorefront("collections", container)
}

collectionHandler.config = {
  event: [
    "product-collection.created",
    "product-collection.updated",
    "product-collection.deleted",
  ],
} satisfies SubscriberConfig

// Categories
export const categoryHandler = async ({ container }: SubscriberArgs<{ id: string }>) => {
  await revalidateStorefront("categories", container)
}

categoryHandler.config = {
  event: [
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
  ],
} satisfies SubscriberConfig
