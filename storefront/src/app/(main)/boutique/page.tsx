import type { Metadata } from "next"
import CollectionHero from "@/components/catalogue/CollectionHero"
import CatalogueContent from "@/components/catalogue/CatalogueContent"
import { getCategories } from "@/lib/medusa/categories"
import { getProducts } from "@/lib/medusa/products"
import { DEFAULT_REGION } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Boutique — Ice Industry",
  description:
    "Découvrez toutes les pièces Ice Industry. Capsules exclusives, vêtements, accessoires et chaussures.",
  openGraph: {
    title: "Boutique — Ice Industry",
    description:
      "Découvrez toutes les pièces Ice Industry. Capsules exclusives, vêtements, accessoires et chaussures.",
  },
}

export default async function BoutiquePage() {
  const [categories, { products, count }] = await Promise.all([
    getCategories().catch(() => []),
    getProducts({ regionId: DEFAULT_REGION, limit: 12 }).catch(() => ({
      products: [],
      count: 0,
    })),
  ])

  // Map root categories as subcategories for tab filtering
  const subcategories = categories.map((cat) => ({
    id: cat.id,
    handle: cat.handle || cat.id,
    name: cat.name,
  }))

  const breadcrumbs = [
    { label: "Accueil", href: "/" },
    { label: "Boutique", href: "/boutique" },
  ]

  return (
    <div className="animate-fade-in">
      <CollectionHero
        title="Boutique"
        label="Catalogue"
        headline="Toute la collection"
        imageUrl="https://api.iceindustry.fr/images/hero/HERO_DESK_ICE2.webp"
        breadcrumbs={breadcrumbs}
        itemCount={count}
      />

      <CatalogueContent
        initialProducts={products}
        initialCount={count}
        subcategories={subcategories}
      />
    </div>
  )
}
