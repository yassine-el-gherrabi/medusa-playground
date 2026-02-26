"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import AnimatedLink from "@/components/ui/AnimatedLink"
import { sdk } from "@/lib/sdk"

type Collection = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any>
  created_at?: string
}

const DEMO_COLLECTIONS: Collection[] = [
  {
    id: "demo-arctic",
    title: "Capsule Arctic",
    handle: "capsule-arctic",
    metadata: { hero_image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80" },
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "demo-nuit",
    title: "Capsule Nuit",
    handle: "capsule-nuit",
    metadata: { hero_image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80" },
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "demo-blaze",
    title: "Capsule Blaze",
    handle: "capsule-blaze",
    metadata: { hero_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" },
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "demo-origines",
    title: "Capsule Origines",
    handle: "capsule-origines",
    metadata: { hero_image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" },
    created_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "demo-shadow",
    title: "Capsule Shadow",
    handle: "capsule-shadow",
    metadata: { hero_image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80" },
    created_at: "2025-11-01T00:00:00Z",
  },
  {
    id: "demo-concrete",
    title: "Capsule Concrete",
    handle: "capsule-concrete",
    metadata: { hero_image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80" },
    created_at: "2025-10-01T00:00:00Z",
  },
  {
    id: "demo-volt",
    title: "Capsule Volt",
    handle: "capsule-volt",
    metadata: { hero_image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&q=80" },
    created_at: "2025-09-01T00:00:00Z",
  },
]

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.collection
      .list({ fields: "id,title,handle,metadata,created_at" })
      .then(({ collections }) => setCollections(collections as Collection[]))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const data = collections.length > 0 ? collections : DEMO_COLLECTIONS
  const sorted = [...data].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  )

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Collections
        </p>
        <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">
          Toutes les Collections
        </h1>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-16 md:pb-24">
        {loading && collections.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="mt-4 h-4 w-32 bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-20 bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {sorted.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  {collection.metadata?.hero_image ? (
                    <Image
                      src={collection.metadata.hero_image}
                      alt={collection.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <span className="text-5xl font-bold opacity-10 uppercase">Ice</span>
                    </div>
                  )}
                </div>
                <h2 className="mt-5 text-sm font-medium uppercase tracking-[0.15em]">
                  {collection.title}
                </h2>
                <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] group-hover:text-foreground transition-colors">
                  Découvrir
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
