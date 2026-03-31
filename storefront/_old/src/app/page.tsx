"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/sdk"
import HeroSection from "@/components/home/HeroSection"
import NouveautesSection from "@/components/home/NouveautesSection"
import NewCollectionSection from "@/components/home/NewCollectionSection"
import CollectionCarousel from "@/components/home/CollectionCarousel"
import ShoesSection from "@/components/home/ShoesSection"
import TriptyqueSection from "@/components/home/TriptyqueSection"

type Collection = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any>
  created_at?: string
}

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    sdk.store.collection
      .list({ fields: "id,title,handle,metadata,created_at" })
      .then(({ collections }) => setCollections(collections as Collection[]))
      .catch(console.error)
  }, [])

  // Sort by creation date, newest first
  const sorted = [...collections].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  )
  const latestCollection = sorted[0] || null

  return (
    <div>
      <HeroSection />
      <NouveautesSection />
      <NewCollectionSection collection={latestCollection} />
      <CollectionCarousel collections={sorted} />
      <ShoesSection />
      <TriptyqueSection />
    </div>
  )
}
