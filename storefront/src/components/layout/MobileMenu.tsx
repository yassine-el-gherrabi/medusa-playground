"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Logo from "./Logo"
import type { Category, Collection } from "@/types"

// Chevron icon with rotation animation
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1}
      stroke="currentColor"
      className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  )
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Reset accordion when menu closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setExpandedSection(null), 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Sort collections newest first
  const sorted = [...collections].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  )
  const latestCollection = sorted[0]

  // Toggle accordion — only one open at a time
  const toggle = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-white lg:hidden ${
        isOpen
          ? "pointer-events-auto visible"
          : "pointer-events-none invisible"
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Header: Close + Logo */}
        <div className="flex items-center px-6 h-14 flex-shrink-0 relative">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:opacity-70 text-foreground"
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
          <Link
            href="/"
            onClick={onClose}
            className="absolute left-1/2 -translate-x-1/2 text-foreground"
          >
            <Logo className="h-24 w-auto" variant="black" />
          </Link>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Mini-hero: Latest collection */}
          {latestCollection && (
            <Link
              href={`/collections/${latestCollection.handle}`}
              onClick={onClose}
              className="block mx-6 mt-4 mb-6"
            >
              <div className="relative aspect-[5/2] overflow-hidden bg-muted">
                {latestCollection.metadata?.hero_image ? (
                  <Image
                    src={latestCollection.metadata.hero_image as string}
                    alt={latestCollection.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-xs uppercase tracking-widest text-white/70 mb-1">
                    Nouvelle collection
                  </p>
                  <p className="text-sm font-semibold text-white uppercase tracking-wide">
                    {latestCollection.title}
                  </p>
                  <span className="text-xs text-white/80 mt-1 inline-block">
                    D&eacute;couvrir &rarr;
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Navigation — Accordion sections */}
          <nav className="px-6">
            {/* ─── Collections (accordion) — first, follows hero ─── */}
            <div className="border-b border-border">
              <button
                onClick={() => toggle("collections")}
                className="w-full flex items-center justify-between py-4 text-sm font-medium uppercase tracking-wide text-foreground"
              >
                <span>Collections</span>
                <Chevron open={expandedSection === "collections"} />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  expandedSection === "collections"
                    ? "grid-rows-[1fr]"
                    : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pb-4 space-y-3">
                    {sorted.map((c) => (
                      <Link
                        key={c.id}
                        href={`/collections/${c.handle}`}
                        onClick={onClose}
                        className="block text-[13px] text-foreground/60 hover:text-foreground transition-colors pl-2"
                      >
                        {c.title}
                      </Link>
                    ))}
                    <div className="pt-1 pl-2">
                      <Link
                        href="/boutique"
                        onClick={onClose}
                        className="text-xs font-medium text-foreground uppercase tracking-[0.12em] hover:opacity-60 transition-opacity"
                      >
                        Tout voir
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Categories (dynamic accordions) ─── */}
            {categories.map((cat) =>
              cat.category_children && cat.category_children.length > 0 ? (
                <div key={cat.id} className="border-b border-border">
                  <button
                    onClick={() => toggle(cat.handle)}
                    className="w-full flex items-center justify-between py-4 text-sm font-medium uppercase tracking-wide text-foreground"
                  >
                    <span>{cat.name}</span>
                    <Chevron open={expandedSection === cat.handle} />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      expandedSection === cat.handle
                        ? "grid-rows-[1fr]"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-4 space-y-3">
                        {cat.category_children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/categories/${child.handle}`}
                            onClick={onClose}
                            className="block text-[13px] text-foreground/60 hover:text-foreground transition-colors pl-2"
                          >
                            {child.name}
                          </Link>
                        ))}
                        <div className="pt-1 pl-2">
                          <Link
                            href={`/categories/${cat.handle}`}
                            onClick={onClose}
                            className="text-[13px] font-medium text-foreground uppercase tracking-[0.12em] hover:opacity-60 transition-opacity"
                          >
                            Tout voir
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={cat.id} className="border-b border-border py-4">
                  <Link
                    href={`/categories/${cat.handle}`}
                    onClick={onClose}
                    className="text-sm font-medium uppercase tracking-wide text-foreground hover:opacity-60 transition-opacity"
                  >
                    {cat.name}
                  </Link>
                </div>
              )
            )}

            {/* ─── Voir tout (direct link) — last, no border-b ─── */}
            <div className="py-4">
              <Link
                href="/boutique"
                onClick={onClose}
                className="text-sm font-medium uppercase tracking-wide text-foreground hover:opacity-60 transition-opacity"
              >
                Voir tout
              </Link>
            </div>
          </nav>
        </div>

        {/* Footer: Account + Service client + Social */}
        <div className="flex-shrink-0 border-t border-border px-6 py-5 space-y-4">
          <div className="flex justify-center gap-8">
            <Link
              href="/account"
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
            >
              Mon compte
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
            >
              Service client
            </Link>
          </div>
          <div className="flex justify-center gap-5">
            <a
              href="https://www.instagram.com/ice_industry_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wide transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@ice_industry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wide transition-colors"
            >
              TikTok
            </a>
            <a
              href="https://www.snapchat.com/@ice_industry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground uppercase tracking-wide transition-colors"
            >
              Snapchat
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
