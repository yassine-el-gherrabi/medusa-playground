import type { Metadata } from "next"
import { notFound } from "next/navigation"
import EditorialHero from "@/components/common/EditorialHero"
import EditorialBlock from "@/components/common/EditorialBlock"
import InlineProductRow from "@/components/common/InlineProductRow"
import { getCollectionByHandle } from "@/lib/medusa/collections"
import { getProducts } from "@/lib/medusa/products"
import { DEFAULT_REGION } from "@/lib/constants"

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) return { title: "Collection introuvable" }

  return {
    title: collection.title,
    description:
      (collection.metadata as Record<string, string>)?.description ||
      `Découvrez la collection ${collection.title} par Ice Industry.`,
    openGraph: {
      title: collection.title,
      images: (collection.metadata as Record<string, string>)?.hero_image
        ? [{ url: (collection.metadata as Record<string, string>).hero_image }]
        : undefined,
    },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) notFound()

  const { products } = await getProducts({
    regionId: DEFAULT_REGION,
    collectionId: [collection.id],
    limit: 20,
  }).catch(() => ({ products: [], count: 0 }))

  const meta = collection.metadata as Record<string, unknown> | null
  const gallery = (meta?.shoot_gallery as string[]) || []

  return (
    <div className="animate-fade-in">
      <EditorialHero
        title={collection.title}
        description={meta?.description as string}
        imageUrl={meta?.hero_image as string}
      />

      {gallery.length > 0 && (
        <div className="mt-1">
          {gallery.map((img, i) => (
            <EditorialBlock
              key={i}
              imageUrl={img}
              reverse={i % 2 !== 0}
              title={i === 0 ? "L'univers de la capsule" : undefined}
              text={i === 0 ? (meta?.description as string) : undefined}
            />
          ))}
        </div>
      )}

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 mb-10">
          <h2 className="text-2xl font-bold">Les pièces de la collection</h2>
        </div>
        {products.length > 0 ? (
          <InlineProductRow products={products} />
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Aucun produit dans cette collection.
          </p>
        )}
      </div>
    </div>
  )
}
