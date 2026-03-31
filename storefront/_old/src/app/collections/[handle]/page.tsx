"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import EditorialHero from "@/components/collections/EditorialHero"
import EditorialBlock from "@/components/collections/EditorialBlock"
import InlineProductRow from "@/components/collections/InlineProductRow"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"

export default function CollectionPage() {
  const { handle } = useParams<{ handle: string }>()
  const { region } = useRegion()
  const [collection, setCollection] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!handle) return

    sdk.store.collection
      .list({ handle, fields: "id,title,handle,metadata" })
      .then(({ collections }) => {
        if (collections?.[0]) setCollection(collections[0])
      })
      .catch(console.error)
  }, [handle])

  useEffect(() => {
    if (!collection?.id || !region) return

    sdk.store.product
      .list({
        collection_id: [collection.id],
        region_id: region.id,
        fields: "*variants.calculated_price",
        limit: 20,
      })
      .then(({ products }) => setProducts(products || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [collection, region])

  if (!collection && loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <ProductGridSkeleton count={8} />
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Collection introuvable.</p>
      </div>
    )
  }

  const gallery: string[] = collection.metadata?.shoot_gallery || []

  return (
    <div className="animate-fade-in">
      {/* Editorial hero */}
      <EditorialHero
        title={collection.title}
        description={collection.metadata?.description}
        imageUrl={collection.metadata?.hero_image}
      />

      {/* Alternating editorial blocks from gallery */}
      {gallery.length > 0 && (
        <div className="mt-1">
          {gallery.map((img: string, i: number) => (
            <EditorialBlock
              key={i}
              imageUrl={img}
              reverse={i % 2 !== 0}
              title={i === 0 ? "L'univers de la capsule" : undefined}
              text={i === 0 ? collection.metadata?.description : undefined}
            />
          ))}
        </div>
      )}

      {/* Products */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 mb-10">
          <h2 className="text-2xl font-bold">Les pieces de la collection</h2>
        </div>
        {loading ? (
          <div className="max-w-7xl mx-auto px-4">
            <ProductGridSkeleton count={8} />
          </div>
        ) : (
          <InlineProductRow products={products} />
        )}
      </div>
    </div>
  )
}
