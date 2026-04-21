export type LayoutMode = "grid" | "mid" | "lookbook"

export type CollectionMeta = {
  hero_image?: string
  hero_line?: string
  description?: string
  season?: string
  manifesto?: string
  editorial_blocks?: { kicker: string; headline: string }[]
  shoot?: ShootData
}

export type ShootData = {
  title: string
  edition?: string
  image_url: string
  credits?: { photographer?: string; stylist?: string; location?: string }
  product_ids: string[]
}
