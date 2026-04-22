import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle } from "@/lib/medusa/collections"
import { getProducts } from "@/lib/medusa/products"
import { DEFAULT_REGION, SITE_NAME, SITE_URL } from "@/lib/constants"
import CollectionHero from "@/components/catalogue/CollectionHero"
import Manifesto from "@/components/catalogue/Manifesto"
import CatalogueContent from "@/components/catalogue/CatalogueContent"
import type { CollectionMeta } from "@/types/catalogue"

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) return { title: "Collection introuvable" }

  const meta = (collection.metadata ?? {}) as unknown as CollectionMeta

  return {
    title: `${collection.title} — ${SITE_NAME}`,
    description:
      meta.description ??
      `Découvrez la collection ${collection.title} par ${SITE_NAME}.`,
    openGraph: {
      title: `${collection.title} — ${SITE_NAME}`,
      description:
        meta.description ??
        `Découvrez la collection ${collection.title} par ${SITE_NAME}.`,
      images: meta.hero_image ? [{ url: meta.hero_image }] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/collections/${handle}`,
    },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) notFound()

  const { products, count } = await getProducts({
    regionId: DEFAULT_REGION,
    collectionId: [collection.id],
    limit: 12,
  }).catch(() => ({ products: [] as import("@/types").Product[], count: 0 }))

  const meta = (collection.metadata ?? {}) as unknown as CollectionMeta

  const breadcrumbs = [
    { label: "Accueil", href: "/" },
    { label: collection.title, href: `/collections/${handle}` },
  ]

  return (
    <div className="-mt-16 animate-fade-in">
      <CollectionHero
        title={collection.title}
        season={meta.season}
        itemCount={count}
        imageUrl={meta.hero_image}
        headline={meta.hero_line}
        breadcrumbs={breadcrumbs}
      />

      {meta.manifesto && (
        <Manifesto
          title={collection.title}
          description={meta.description}
          kicker={meta.season}
          body={meta.manifesto}
        />
      )}

      <CatalogueContent
        initialProducts={products}
        initialCount={count}
        collectionId={collection.id}
        editorialBlocks={meta.editorial_blocks}
        shootData={meta.shoot}
      />
    </div>
  )
}
