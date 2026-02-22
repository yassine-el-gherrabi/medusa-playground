"use client"

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

export default function MegaMenu({
  categories,
  collections,
  isOpen,
  activeSection,
  onClose,
}: {
  categories: Category[]
  collections: Collection[]
  isOpen: boolean
  activeSection: string | null
  onClose: () => void
}) {
  if (!isOpen || !activeSection) return null

  const sorted = [...collections].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  )
  const latest = sorted[0]
  const older = sorted.slice(1)

  const accessoires = categories.find((c) => c.handle === "accessoires")
  const chaussures = categories.find((c) => c.handle === "chaussures")

  return (
    <div className="absolute top-full left-0 w-full bg-white border-t border-border z-50 hidden lg:block">
      <div className="max-w-7xl mx-auto p-8">
        {/* Vetements section */}
        {activeSection === "vetements" && (
          <div className="grid grid-cols-4 gap-8">
            {/* Left: Latest capsule visual */}
            <div className="col-span-1">
              {latest && (
                <Link href={`/collections/${latest.handle}`} onClick={onClose} className="group block">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-3">
                    {latest.metadata?.hero_image && (
                      <Image
                        src={latest.metadata.hero_image}
                        alt={latest.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs uppercase tracking-widest text-white/70 mb-1">Nouvelle capsule</p>
                      <p className="text-lg font-bold text-white">{latest.title}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground hover:underline">
                    Decouvrir &rarr;
                  </span>
                </Link>
              )}
            </div>

            {/* Center: Collections */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Collections</p>
              <ul className="space-y-2">
                {older.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/collections/${c.handle}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                      onClick={onClose}
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/voir-tout"
                    className="text-sm font-medium text-foreground hover:underline block pt-2"
                    onClick={onClose}
                  >
                    VOIR TOUT &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Accessoires section */}
        {activeSection === "accessoires" && accessoires && (
          <div className="grid grid-cols-4 gap-8">
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Accessoires</p>
              <ul className="space-y-2">
                {accessoires.category_children?.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${child.handle}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/accessoires"
                    className="text-sm font-medium text-foreground hover:underline block pt-2"
                    onClick={onClose}
                  >
                    Tous les accessoires &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Chaussures section */}
        {activeSection === "chaussures" && chaussures && (
          <div className="grid grid-cols-4 gap-8">
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Chaussures</p>
              <ul className="space-y-2">
                {chaussures.category_children?.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${child.handle}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/categories/chaussures"
                    className="text-sm font-medium text-foreground hover:underline block pt-2"
                    onClick={onClose}
                  >
                    Toutes les chaussures &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
