import { Suspense } from "react"
import type { Metadata } from "next"
import EditorialHero from "@/components/common/EditorialHero"
import BoutiqueContent from "./BoutiqueContent"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"
import { getCategories } from "@/lib/medusa/categories"
import { getCollections } from "@/lib/medusa/collections"
import { getProducts } from "@/lib/medusa/products"
import { DEFAULT_REGION } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Découvrez toutes les pièces Ice Industry. Capsules exclusives, vêtements, accessoires et chaussures.",
}

export default async function BoutiquePage() {
  const [categories, collections, { products, count }] = await Promise.all([
    getCategories().catch(() => []),
    getCollections().catch(() => []),
    getProducts({ regionId: DEFAULT_REGION, limit: 12 }).catch(() => ({
      products: [],
      count: 0,
    })),
  ])

  return (
    <div className="-mt-16 animate-fade-in">
      <EditorialHero
        title="Boutique"
        label="Catalogue"
        imageUrl="/images/hero-ice2.webp"
      />

      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 pb-20"><ProductGridSkeleton count={12} /></div>}>
        <BoutiqueContent
          initialProducts={products}
          initialCount={count}
          categories={categories}
          collections={collections}
        />
      </Suspense>
    </div>
  )
}
