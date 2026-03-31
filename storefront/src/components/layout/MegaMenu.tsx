"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Category, Collection } from "@/types"

type HoveredItem = { image: string; title: string; href: string }

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"

export default function MegaMenu({
  categories,
  collections,
  isOpen,
  onClose,
}: {
  categories: Category[]
  collections: Collection[]
  isOpen: boolean
  onClose: () => void
}) {
  const sorted = [...collections].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  )
  const latest = sorted[0] || null
  const firstCategory = categories[0]

  const defaultCollectionItem: HoveredItem = latest
    ? {
        image: (latest.metadata?.hero_image as string) || FALLBACK_IMAGE,
        title: latest.title,
        href: `/collections/${latest.handle}`,
      }
    : { image: FALLBACK_IMAGE, title: "Collections", href: "/boutique" }

  const defaultCategoryItem: HoveredItem = firstCategory
    ? {
        image: (firstCategory.metadata?.image as string) || FALLBACK_IMAGE,
        title: firstCategory.name,
        href: `/categories/${firstCategory.handle}`,
      }
    : { image: FALLBACK_IMAGE, title: "Boutique", href: "/boutique" }

  const [hoveredCollection, setHoveredCollection] =
    useState<HoveredItem>(defaultCollectionItem)
  const [hoveredCategory, setHoveredCategory] =
    useState<HoveredItem>(defaultCategoryItem)

  const resetHover = useCallback(() => {
    setHoveredCollection(defaultCollectionItem)
    setHoveredCategory(defaultCategoryItem)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCollectionItem.image, defaultCategoryItem.image])

  const hoverCollection = (c: Collection) => {
    setHoveredCollection({
      image: (c.metadata?.hero_image as string) || defaultCollectionItem.image,
      title: c.title,
      href: `/collections/${c.handle}`,
    })
  }

  const hoverCategory = (cat: Category, displayName?: string) => {
    setHoveredCategory({
      image: (cat.metadata?.image as string) || defaultCategoryItem.image,
      title: displayName || cat.name,
      href: `/categories/${cat.handle}`,
    })
  }

  return (
    <div
      className={`hidden lg:block overflow-hidden ${isOpen ? "" : "max-h-0"}`}
      onMouseEnter={resetHover}
    >
      <div className="bg-white border-t border-border relative">
        <div className="px-6 lg:px-10 py-10">
          <div className="grid grid-cols-[180px_220px_1fr_1fr] gap-6">
            {/* Column 1: Collections */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-5">
                Collections
              </p>
              <ul className="space-y-2.5">
                {sorted.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/collections/${c.handle}`}
                      onClick={onClose}
                      onMouseEnter={() => hoverCollection(c)}
                      className="text-xs text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    href="/boutique"
                    onClick={onClose}
                    className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                  >
                    Toutes les collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Boutique categories */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-5">
                Boutique
              </p>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={cat.category_children?.length ? "mb-5" : "mb-3"}
                >
                  <Link
                    href={`/categories/${cat.handle}`}
                    onClick={onClose}
                    onMouseEnter={() => hoverCategory(cat)}
                    className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                  >
                    {cat.name}
                  </Link>
                  {cat.category_children && cat.category_children.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {cat.category_children.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/categories/${sub.handle}`}
                            className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                            onClick={onClose}
                            onMouseEnter={() => hoverCategory(cat, sub.name)}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <div className="pt-2">
                <Link
                  href="/boutique"
                  onClick={onClose}
                  className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                >
                  Tout voir
                </Link>
              </div>
            </div>

            {/* Column 3: Collection image */}
            <Link href={hoveredCollection.href} onClick={onClose} className="group block">
              <div className="relative h-[420px] overflow-hidden bg-muted">
                <div key={hoveredCollection.image} className="absolute inset-0 animate-fade-in-image">
                  <Image
                    src={hoveredCollection.image}
                    alt={hoveredCollection.title}
                    fill
                    className="object-cover"
                    sizes="30vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm font-semibold text-white uppercase tracking-wide">
                    {hoveredCollection.title}
                  </p>
                  <span className="text-xs text-white/80 mt-2 inline-block group-hover:text-white transition-colors">
                    Découvrir &rarr;
                  </span>
                </div>
              </div>
            </Link>

            {/* Column 4: Category image */}
            <Link href={hoveredCategory.href} onClick={onClose} className="group block">
              <div className="relative h-[420px] overflow-hidden bg-muted">
                <div key={hoveredCategory.image} className="absolute inset-0 animate-fade-in-image">
                  <Image
                    src={hoveredCategory.image}
                    alt={hoveredCategory.title}
                    fill
                    className="object-cover"
                    sizes="30vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm font-semibold text-white uppercase tracking-wide">
                    {hoveredCategory.title}
                  </p>
                  <span className="text-xs text-white/80 mt-2 inline-block group-hover:text-white transition-colors">
                    Découvrir &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
