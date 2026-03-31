import type { MetadataRoute } from "next"
import { SITE_URL, DEFAULT_REGION } from "@/lib/constants"
import { getProducts } from "@/lib/medusa/products"
import { getCollections } from "@/lib/medusa/collections"
import { getCategories } from "@/lib/medusa/categories"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, collections, categories] = await Promise.all([
    getProducts({ regionId: DEFAULT_REGION, limit: 200 }).catch(() => ({
      products: [],
      count: 0,
    })),
    getCollections(100).catch(() => []),
    getCategories().catch(() => []),
  ])

  const productUrls = products.map((p) => ({
    url: `${SITE_URL}/products/${p.handle}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const collectionUrls = collections.map((c) => ({
    url: `${SITE_URL}/collections/${c.handle}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const categoryUrls = categories.map((c) => ({
    url: `${SITE_URL}/categories/${c.handle}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    { url: `${SITE_URL}/boutique`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.3 },
    ...productUrls,
    ...collectionUrls,
    ...categoryUrls,
  ]
}
