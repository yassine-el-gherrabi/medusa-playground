import { Suspense } from "react"
import { REVALIDATE_PRODUCTS } from "@/lib/constants"
import HeroSection from "@/components/home/HeroSection"
import NouveautesSection from "@/components/home/NouveautesSection"
import NewCollectionSection from "@/components/home/NewCollectionSection"
import CollectionCarousel from "@/components/home/CollectionCarousel"
import ShoesSection from "@/components/home/ShoesSection"
import TriptyqueSection from "@/components/home/TriptyqueSection"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"
import { getProducts } from "@/lib/medusa/products"
import { getCollections } from "@/lib/medusa/collections"
import { DEFAULT_REGION } from "@/lib/constants"
import type { HeroSlide } from "@/components/home/HeroSection"
import type { ShoeImage } from "@/components/home/ShoesSection"
import type { TriptyqueCard } from "@/components/home/TriptyqueSection"

// ISR: regenerate every 120s — if build-time fetch fails, next visitor gets fresh data
export const revalidate = REVALIDATE_PRODUCTS

// ── Editorial content (static, managed by the team) ──

const HERO_SLIDES: HeroSlide[] = [
  {
    type: "image",
    desktop: "/images/hero/hero-desk-1.webp",
    mobile: "/images/hero/hero-mobile-2.webp",
    alt: "Ice Industry — Terrain Sauvage",
    kicker: "Nouvelle Capsule",
    headline: "Terrain Sauvage",
    subline: "Collection Hiver 2026",
    cta: "Découvrir la collection",
    ctaHref: "/collections/capsule-arctic",
  },
  {
    type: "image",
    desktop: "/images/hero/hero-desk-2.webp",
    mobile: "/images/hero/hero-mobile-1.webp",
    alt: "Ice Industry — Nés du Froid",
    kicker: "Marseille",
    headline: "Nés du Froid",
    subline: "Streetwear Technique",
    cta: "Explorer l'univers",
    ctaHref: "/boutique",
  },
]

const SHOE_IMAGES: ShoeImage[] = [
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80",
    alt: "Nike sneaker rouge",
  },
  {
    src: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1920&q=80",
    alt: "Sneaker blanche",
  },
  {
    src: "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1920&q=80",
    alt: "Jordan sneaker",
  },
]

const TRIPTYCH_CARDS: TriptyqueCard[] = [
  {
    title: "Notre boutique à Marseille",
    subtitle: "Boutique",
    description:
      "Retrouvez-nous au cœur de Marseille. Découvrez l'univers Ice Industry en personne.",
    href: "/notre-boutique",
    cta: "Découvrir la boutique",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  },
  {
    title: "Newsletter",
    subtitle: "Ne rate aucun drop",
    description:
      "Accès anticipé aux collections, offres exclusives et coulisses de la marque.",
    href: "/newsletter",
    cta: "S'inscrire",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  },
  {
    title: "Ice Gallery",
    subtitle: "Backstage",
    description:
      "Notre univers visuel. Shootings, collaborations et inspirations streetwear.",
    href: "/boutique",
    cta: "Voir la Ice Gallery",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
  },
]

// ── Data fetching (server-side) ──

async function fetchWithRetry<T>(fn: () => Promise<T>, fallback: T, retries = 2): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch { if (i < retries - 1) await new Promise((r) => setTimeout(r, 500)) }
  }
  return fallback
}

async function getHomeData() {
  const [collections, productsResult] = await Promise.all([
    fetchWithRetry(() => getCollections(), []),
    fetchWithRetry(() => getProducts({ regionId: DEFAULT_REGION, limit: 12 }), { products: [], count: 0 }),
  ])

  const sorted = [...collections].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  )

  // Filter out fully sold-out products (all variants at 0 inventory)
  const availableProducts = productsResult.products.filter((p) => {
    if (!p.variants?.length) return true
    return p.variants.some((v) => (v.inventory_quantity ?? 1) > 0)
  })

  return {
    collections: sorted,
    latestCollection: sorted[0] ?? null,
    products: availableProducts,
  }
}

// ── Page component (Server Component) ──

export default async function HomePage() {
  const { collections, latestCollection, products } = await getHomeData()

  return (
    <div>
      <HeroSection slides={HERO_SLIDES} />

      <Suspense fallback={<div className="px-6 py-16"><ProductGridSkeleton count={6} /></div>}>
        <NouveautesSection products={products} />
      </Suspense>

      {latestCollection && (
        <NewCollectionSection collection={latestCollection} />
      )}

      <CollectionCarousel collections={collections} />

      <ShoesSection images={SHOE_IMAGES} />

      <TriptyqueSection cards={TRIPTYCH_CARDS} />
    </div>
  )
}
