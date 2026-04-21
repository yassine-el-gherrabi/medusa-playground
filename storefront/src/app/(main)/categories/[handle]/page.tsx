import type { Metadata } from "next"
import { notFound } from "next/navigation"
import CollectionHero from "@/components/catalogue/CollectionHero"
import CatalogueContent from "@/components/catalogue/CatalogueContent"
import { getCategoryByHandle } from "@/lib/medusa/categories"
import { getProducts } from "@/lib/medusa/products"
import { DEFAULT_REGION } from "@/lib/constants"

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const category = await getCategoryByHandle(handle)

  if (!category) return { title: "Catégorie introuvable" }

  return {
    title: `${category.name} — Ice Industry`,
    description: `Découvrez les produits ${category.name} par Ice Industry.`,
    openGraph: {
      title: `${category.name} — Ice Industry`,
      description: `Découvrez les produits ${category.name} par Ice Industry.`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { handle } = await params
  const category = await getCategoryByHandle(handle)

  if (!category) notFound()

  const meta = category.metadata as Record<string, string> | null
  const children = (category.category_children || []).map((child) => ({
    id: child.id,
    handle: child.handle || child.id,
    name: child.name,
  }))

  const { products, count } = await getProducts({
    regionId: DEFAULT_REGION,
    categoryId: [category.id],
    limit: 12,
  }).catch(() => ({ products: [], count: 0 }))

  const breadcrumbs = [
    { label: "Accueil", href: "/" },
    { label: "Catégories", href: "/boutique" },
    { label: category.name, href: `/categories/${handle}` },
  ]

  return (
    <div className="animate-fade-in">
      <CollectionHero
        title={category.name}
        label="Catégorie"
        imageUrl={meta?.hero_image || meta?.image}
        itemCount={count}
        breadcrumbs={breadcrumbs}
      />

      <CatalogueContent
        initialProducts={products}
        initialCount={count}
        categoryId={category.id}
        subcategories={children}
      />
    </div>
  )
}
