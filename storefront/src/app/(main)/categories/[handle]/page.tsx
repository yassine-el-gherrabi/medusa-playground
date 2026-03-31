import type { Metadata } from "next"
import { notFound } from "next/navigation"
import EditorialHero from "@/components/common/EditorialHero"
import CategoryContent from "./CategoryContent"
import { getCategoryByHandle } from "@/lib/medusa/categories"
import { getProducts } from "@/lib/medusa/products"
import { DEFAULT_REGION } from "@/lib/constants"

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const category = await getCategoryByHandle(handle)

  if (!category) return { title: "Catégorie introuvable" }

  return {
    title: category.name,
    description: `Découvrez les produits ${category.name} par Ice Industry.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { handle } = await params
  const category = await getCategoryByHandle(handle)

  if (!category) notFound()

  const meta = category.metadata as Record<string, string> | null
  const children = category.category_children || []

  const { products, count } = await getProducts({
    regionId: DEFAULT_REGION,
    categoryId: [category.id],
    limit: 12,
  }).catch(() => ({ products: [], count: 0 }))

  return (
    <div className="animate-fade-in">
      <EditorialHero
        title={category.name}
        label="Catégorie"
        imageUrl={meta?.hero_image || meta?.image}
      />

      <CategoryContent
        categoryId={category.id}
        children={children}
        initialProducts={products}
        initialCount={count}
      />
    </div>
  )
}
