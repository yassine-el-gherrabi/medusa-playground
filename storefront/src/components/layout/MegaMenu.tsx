"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

type Category = {
  id: string
  name: string
  handle: string
  category_children?: Category[]
}

type Collection = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any>
  created_at?: string
}

type HoveredItem = {
  image: string
  title: string
  href: string
}

// Fallback images for categories (dev placeholders — replace with real editorial shots)
const CATEGORY_IMAGES: Record<string, string> = {
  vetements:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
  accessoires:
    "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800&q=80",
  chaussures:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  "ice-for-girls":
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
}

const MAX_COLLECTIONS = 5

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
  // Sort collections by date (newest first)
  const sorted = [...collections].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  )

  const visible = sorted.slice(0, MAX_COLLECTIONS)
  const latest = sorted[0] || null

  // Find categories
  const vetements = categories.find((c) => c.handle === "vetements")
  const accessoires = categories.find((c) => c.handle === "accessoires")
  const chaussures = categories.find((c) => c.handle === "chaussures")
  const iceForGirls = categories.find((c) => c.handle === "ice-for-girls")

  // Default items for each image
  const defaultCollectionItem: HoveredItem = latest
    ? {
        image:
          latest.metadata?.hero_image ||
          "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80",
        title: latest.title,
        href: `/collections/${latest.handle}`,
      }
    : {
        image:
          "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80",
        title: "Collections",
        href: "/collections",
      }

  const defaultCategoryItem: HoveredItem = {
    image: CATEGORY_IMAGES["vetements"] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    title: "Vêtements",
    href: "/categories/vetements",
  }

  // Two independent hover states
  const [hoveredCollection, setHoveredCollection] = useState<HoveredItem>(defaultCollectionItem)
  const [hoveredCategory, setHoveredCategory] = useState<HoveredItem>(defaultCategoryItem)

  // Reset both states when menu re-opens
  const resetHover = useCallback(() => {
    setHoveredCollection(defaultCollectionItem)
    setHoveredCategory(defaultCategoryItem)
  }, [defaultCollectionItem.image, defaultCollectionItem.title, defaultCollectionItem.href])

  // Hover handler for collections → updates left image
  const hoverCollection = (c: Collection) => {
    setHoveredCollection({
      image:
        c.metadata?.hero_image || defaultCollectionItem.image,
      title: c.title,
      href: `/collections/${c.handle}`,
    })
  }

  // Hover handlers for categories → updates right image
  const hoverCategory = (handle: string, name: string) => {
    setHoveredCategory({
      image: CATEGORY_IMAGES[handle] || defaultCategoryItem.image,
      title: name,
      href: `/categories/${handle}`,
    })
  }

  return (
    <div
      className={`hidden lg:block overflow-hidden ${
        isOpen ? "" : "max-h-0"
      }`}
      onMouseEnter={resetHover}
    >
      <div className="bg-white border-t border-border relative">
        {/* X close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fermer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content — 4-column: Collections + Boutique + 2 reactive images */}
        <div className="px-6 lg:px-10 py-10">
          <div className="grid grid-cols-[180px_220px_1fr_1fr] gap-6">
            {/* ─── Column 1: Collections ─── */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-5">
                Collections
              </p>
              <ul className="space-y-2.5">
                {visible.map((c) => (
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
                    href="/collections"
                    onClick={onClose}
                    className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                  >
                    Tout voir
                  </Link>
                </li>
              </ul>
            </div>

            {/* ─── Column 2: Boutique categories ─── */}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-5">
                Boutique
              </p>

              {vetements && (
                <div className="mb-5">
                  <Link
                    href={`/categories/${vetements.handle}`}
                    onClick={onClose}
                    onMouseEnter={() => hoverCategory(vetements.handle, "Vêtements")}
                    className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                  >
                    Vêtements
                  </Link>
                  {vetements.category_children &&
                    vetements.category_children.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {vetements.category_children.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/categories/${sub.handle}`}
                              className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                              onClick={onClose}
                              onMouseEnter={() =>
                                hoverCategory(vetements.handle, sub.name)
                              }
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              )}

              {accessoires && (
                <div className="mb-5">
                  <Link
                    href={`/categories/${accessoires.handle}`}
                    onClick={onClose}
                    onMouseEnter={() => hoverCategory(accessoires.handle, "Accessoires")}
                    className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                  >
                    Accessoires
                  </Link>
                  {accessoires.category_children &&
                    accessoires.category_children.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {accessoires.category_children.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/categories/${sub.handle}`}
                              className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                              onClick={onClose}
                              onMouseEnter={() =>
                                hoverCategory(accessoires.handle, sub.name)
                              }
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              )}

              {chaussures && (
                <div className="mb-3">
                  <Link
                    href={`/categories/${chaussures.handle}`}
                    onClick={onClose}
                    onMouseEnter={() => hoverCategory(chaussures.handle, "Chaussures")}
                    className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                  >
                    Chaussures
                  </Link>
                </div>
              )}

              {iceForGirls && (
                <div className="mb-3">
                  <Link
                    href={`/categories/${iceForGirls.handle}`}
                    onClick={onClose}
                    onMouseEnter={() => hoverCategory(iceForGirls.handle, "Ice for Girls")}
                    className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                  >
                    Ice for Girls
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/boutique"
                  onClick={onClose}
                  onMouseEnter={() =>
                    setHoveredCategory({
                      image: "/images/hero-ice2.webp",
                      title: "Boutique",
                      href: "/boutique",
                    })
                  }
                  className="text-[11px] font-medium text-foreground uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
                >
                  Tout voir
                </Link>
              </div>
            </div>

            {/* ─── Column 3: COLLECTIONS IMAGE ─── */}
            <Link
              href={hoveredCollection.href}
              onClick={onClose}
              className="group block"
            >
              <div className="relative h-[420px] overflow-hidden bg-muted">
                <div
                  key={hoveredCollection.image}
                  className="absolute inset-0 animate-fade-in-image"
                >
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

            {/* ─── Column 4: BOUTIQUE IMAGE ─── */}
            <Link
              href={hoveredCategory.href}
              onClick={onClose}
              className="group block"
            >
              <div className="relative h-[420px] overflow-hidden bg-muted">
                <div
                  key={hoveredCategory.image}
                  className="absolute inset-0 animate-fade-in-image"
                >
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
