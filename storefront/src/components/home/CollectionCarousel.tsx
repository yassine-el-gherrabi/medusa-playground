"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

type Collection = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any>
}

const DEMO_COLLECTIONS: Collection[] = [
  {
    id: "demo-1",
    title: "Capsule Hiver",
    handle: "voir-tout",
    metadata: { hero_image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80" },
  },
  {
    id: "demo-2",
    title: "Essentials",
    handle: "voir-tout",
    metadata: { hero_image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80" },
  },
  {
    id: "demo-3",
    title: "Ice for Girls",
    handle: "ice-for-girls",
    metadata: { hero_image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" },
  },
  {
    id: "demo-4",
    title: "Streetwear",
    handle: "voir-tout",
    metadata: { hero_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" },
  },
]

export default function CollectionCarousel({ collections }: { collections: Collection[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const data = collections.length > 0 ? collections : DEMO_COLLECTIONS

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-white"
    >
      <div
        className={`transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Section header */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Explorez
          </p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">
              Toutes les Collections
            </h2>
            <Link
              href="/voir-tout"
              className="text-xs font-medium uppercase tracking-[0.2em] hover:opacity-60 transition-opacity hidden md:block"
            >
              Voir tout
            </Link>
          </div>
        </div>

        {/* Full-width horizontal scroll — no borders */}
        <div
          className="flex gap-5 overflow-x-auto pl-6 md:pl-10 pr-6 md:pr-10 pb-4 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {data.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="flex-shrink-0 w-[70vw] md:w-[35vw] lg:w-[28vw] group"
            >
              {/* Image — no rounded corners, no border, no gradient */}
              <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-5">
                {collection.metadata?.hero_image ? (
                  <Image
                    src={collection.metadata.hero_image}
                    alt={collection.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 70vw, (max-width: 1024px) 35vw, 28vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <span className="text-5xl font-bold opacity-10 uppercase">Ice</span>
                  </div>
                )}
              </div>
              {/* Text below image */}
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] mb-2">
                {collection.title}
              </h3>
              <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] group-hover:text-foreground transition-colors">
                Decouvrir
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile "Voir tout" */}
        <div className="px-6 md:px-10 mt-8 md:hidden">
          <Link
            href="/voir-tout"
            className="text-xs font-medium uppercase tracking-[0.2em] hover:opacity-60 transition-opacity"
          >
            Voir tout
          </Link>
        </div>
      </div>
    </section>
  )
}
