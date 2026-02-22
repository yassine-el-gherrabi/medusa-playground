"use client"

import { useState } from "react"
import Link from "next/link"

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

export default function MobileMenu({
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Sort collections newest first
  const sorted = [...collections].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  )
  const latestCollection = sorted[0]

  const accessoires = categories.find((c) => c.handle === "accessoires")
  const iceForGirls = categories.find((c) => c.handle === "ice-for-girls")
  const chaussures = categories.find((c) => c.handle === "chaussures")

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 overflow-y-auto transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-bold text-lg tracking-widest uppercase text-foreground">Ice Industry</span>
          <button onClick={onClose} className="p-2 hover:opacity-70 text-foreground" aria-label="Fermer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="py-2">
          {/* 1. Nouvelle collection */}
          {latestCollection && (
            <Link
              href={`/collections/${latestCollection.handle}`}
              className="block px-4 py-3 border-b border-border text-sm font-medium uppercase tracking-wide text-foreground hover:bg-muted"
              onClick={onClose}
            >
              Nouvelle collection
            </Link>
          )}

          {/* 2. Vetements / Collections (expandable) */}
          <div className="border-b border-border">
            <div className="flex items-center justify-between">
              <Link
                href="/voir-tout"
                className="flex-1 px-4 py-3 text-sm font-medium uppercase tracking-wide text-foreground hover:bg-muted"
                onClick={onClose}
              >
                Vetements
              </Link>
              {collections.length > 0 && (
                <button
                  onClick={() => toggleExpand("collections")}
                  className="px-4 py-3 hover:bg-muted text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform ${
                      expandedIds.has("collections") ? "rotate-180" : ""
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              )}
            </div>
            {expandedIds.has("collections") && (
              <div className="bg-muted">
                {sorted.map((c) => (
                  <Link
                    key={c.id}
                    href={`/collections/${c.handle}`}
                    className="block pl-8 pr-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                  >
                    {c.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 3. Accessoires (expandable) */}
          {accessoires && (
            <div className="border-b border-border">
              <div className="flex items-center justify-between">
                <Link
                  href="/accessoires"
                  className="flex-1 px-4 py-3 text-sm font-medium uppercase tracking-wide text-foreground hover:bg-muted"
                  onClick={onClose}
                >
                  Accessoires
                </Link>
                {accessoires.category_children && accessoires.category_children.length > 0 && (
                  <button
                    onClick={() => toggleExpand("accessoires")}
                    className="px-4 py-3 hover:bg-muted text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`w-4 h-4 transition-transform ${
                        expandedIds.has("accessoires") ? "rotate-180" : ""
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                )}
              </div>
              {expandedIds.has("accessoires") && accessoires.category_children && (
                <div className="bg-muted">
                  {accessoires.category_children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.handle}`}
                      className="block pl-8 pr-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Chaussures (expandable) */}
          {chaussures && (
            <div className="border-b border-border">
              <div className="flex items-center justify-between">
                <Link
                  href="/categories/chaussures"
                  className="flex-1 px-4 py-3 text-sm font-medium uppercase tracking-wide text-foreground hover:bg-muted"
                  onClick={onClose}
                >
                  Chaussures
                </Link>
                {chaussures.category_children && chaussures.category_children.length > 0 && (
                  <button
                    onClick={() => toggleExpand("chaussures")}
                    className="px-4 py-3 hover:bg-muted text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`w-4 h-4 transition-transform ${
                        expandedIds.has("chaussures") ? "rotate-180" : ""
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                )}
              </div>
              {expandedIds.has("chaussures") && chaussures.category_children && (
                <div className="bg-muted">
                  {chaussures.category_children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.handle}`}
                      className="block pl-8 pr-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Ice for Girls */}
          {iceForGirls && (
            <Link
              href="/ice-for-girls"
              className="block px-4 py-3 border-b border-border text-sm font-medium uppercase tracking-wide text-foreground hover:bg-muted"
              onClick={onClose}
            >
              Ice for Girls
            </Link>
          )}

          {/* 6. Voir tout */}
          <Link
            href="/voir-tout"
            className="block px-4 py-3 border-b border-border text-sm font-medium uppercase tracking-wide text-foreground hover:bg-muted"
            onClick={onClose}
          >
            Voir tout
          </Link>

          {/* Separator */}
          <div className="h-px bg-border my-2" />

          {/* 7. FAQ */}
          <Link
            href="/faq"
            className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onClose}
          >
            FAQ
          </Link>

          {/* 8. Contact */}
          <Link
            href="/contact"
            className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onClose}
          >
            Contact
          </Link>

          {/* 9. Mon compte */}
          <Link
            href="/account"
            className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onClose}
          >
            Mon compte
          </Link>
        </nav>
      </div>
    </>
  )
}
