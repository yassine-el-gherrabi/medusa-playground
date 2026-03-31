"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { sdk } from "@/lib/sdk"
import { isOverlayRoute, getHeroHeightFraction } from "@/lib/utils"
import { useCart } from "@/providers/cart"
import CartIcon from "./CartIcon"
import CartDrawer from "@/components/cart/CartDrawer"
import MegaMenu from "./MegaMenu"
import MobileMenu from "./MobileMenu"
import SearchOverlay from "./SearchOverlay"
import Logo from "./Logo"

type Category = {
  id: string
  name: string
  handle: string
  metadata?: Record<string, any>
  category_children?: Category[]
}

type Collection = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any>
  created_at?: string
}

// Fallback data when Medusa backend is unavailable
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

const DEMO_CATEGORIES: Category[] = [
  {
    id: "demo-vetements",
    name: "V\u00eatements",
    handle: "vetements",
    category_children: [
      { id: "demo-hauts", name: "Hauts", handle: "hauts" },
      { id: "demo-bas", name: "Bas", handle: "bas" },
      { id: "demo-vestes", name: "Vestes & Manteaux", handle: "vestes-manteaux" },
    ],
  },
  {
    id: "demo-accessoires",
    name: "Accessoires",
    handle: "accessoires",
    category_children: [
      { id: "demo-lunettes", name: "Lunettes de soleil", handle: "lunettes-de-soleil" },
      { id: "demo-casquettes", name: "Casquettes", handle: "casquettes" },
      { id: "demo-cache-cou", name: "Cache-cou", handle: "cache-cou" },
    ],
  },
  {
    id: "demo-chaussures",
    name: "Chaussures",
    handle: "chaussures",
  },
  {
    id: "demo-ice-for-girls",
    name: "Ice for Girls",
    handle: "ice-for-girls",
  },
]

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const isOverlay = isOverlayRoute(pathname)
  const { cart, openDrawer } = useCart()
  const cartCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastScrollY = useRef(0)
  const headerOffset = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const heroFractionRef = useRef(getHeroHeightFraction(pathname))
  const HEADER_H = 64

  // Data fetching
  useEffect(() => {
    sdk.store.category
      .list({
        fields: "id,name,handle,metadata,*category_children",
        parent_category_id: "null",
      })
      .then(({ product_categories }) => {
        setCategories(product_categories as Category[])
      })
      .catch(console.error)

    sdk.store.collection
      .list({ fields: "id,title,handle,metadata,created_at" })
      .then(({ collections }) => {
        setCollections(collections as Collection[])
      })
      .catch(console.error)
  }, [])

  // Update hero fraction on route change
  useEffect(() => {
    heroFractionRef.current = getHeroHeightFraction(pathname)
    const threshold = heroFractionRef.current * window.innerHeight - HEADER_H
    setScrolled(window.scrollY > threshold)
  }, [pathname])

  // Scroll detection: navbar moves pixel-by-pixel with scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      setScrolled(currentY > heroFractionRef.current * window.innerHeight - HEADER_H)

      // Move header by scroll delta, clamped between -HEADER_H and 0
      headerOffset.current = Math.min(0, Math.max(-HEADER_H, headerOffset.current - delta))

      // Always fully visible at top of page
      if (currentY <= 0) headerOffset.current = 0

      if (headerRef.current) {
        headerRef.current.style.transform = `translateY(${headerOffset.current}px)`
      }

      lastScrollY.current = currentY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Escape key to close mega menu
  useEffect(() => {
    if (!megaMenuOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaMenuOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [megaMenuOpen])

  // Close mega menu on route change
  useEffect(() => {
    setMegaMenuOpen(false)
  }, [pathname])

  const openMegaMenu = useCallback(() => {
    setMegaMenuOpen(true)
  }, [])

  const closeMegaMenu = useCallback(() => {
    setMegaMenuOpen(false)
  }, [])

  // Use real data or fallback demo data
  const activeCollections = collections.length > 0 ? collections : DEMO_COLLECTIONS
  // Use real categories from backend, fallback to demo data for development
  const activeCategories = categories.length > 0 ? categories : DEMO_CATEGORIES

  // Find newest collection
  const latestCollection = activeCollections.reduce((latest, c) =>
    new Date(c.created_at || 0) > new Date(latest.created_at || 0)
      ? c
      : latest
  )

  const transparent = isOverlay && !scrolled && !megaMenuOpen
  const headerBg = transparent ? "bg-transparent" : "bg-white"
  const borderStyle = ""
  const textColor = transparent ? "text-white" : "text-foreground"

  return (
    <>
      <header
        ref={headerRef}
        onMouseLeave={closeMegaMenu}
        className={`fixed top-0 left-0 right-0 z-30 ${headerBg} ${textColor}`}
      >
        {/* Navbar bar */}
        <div className="h-16 px-6 lg:px-10 flex items-center">
          {/* Mobile LEFT: Burger + Search */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              className="p-2 -ml-2 hover:opacity-70"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <div className="flex flex-col gap-[5px]">
                <span className="block w-5 h-[1px] bg-current" />
                <span className="block w-3.5 h-[1px] bg-current" />
              </div>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:opacity-70 cursor-pointer"
              aria-label="Rechercher"
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
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>

          {/* Desktop LEFT: Nav items */}
          <nav className="hidden lg:flex items-center gap-12 flex-1">
            <button
              onMouseEnter={openMegaMenu}
              className="group relative text-[11px] font-normal tracking-[0.15em] uppercase"
            >
              Collections
              <span className={`absolute -bottom-0.5 left-0 w-full h-px bg-current transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${megaMenuOpen ? "scale-x-100 origin-left" : "scale-x-0 origin-right group-hover:origin-left group-hover:scale-x-100"}`} />
            </button>
            <Link
              href={`/collections/${latestCollection.handle}`}
              className="group relative text-[11px] font-normal tracking-[0.15em] uppercase"
            >
              {latestCollection.title}
              <span className="absolute -bottom-0.5 left-0 w-full h-px bg-current scale-x-0 origin-right transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:origin-left group-hover:scale-x-100" />
            </Link>
          </nav>

          {/* CENTER: Logo — absolute center on mobile, natural flow on desktop */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center lg:relative absolute left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0"
          >
            <Logo className="h-24 w-auto" variant={transparent ? "white" : "black"} />
          </Link>

          {/* Desktop RIGHT: Utilities (text style, Stone Island inspired) */}
          <div className="hidden lg:flex items-center gap-12 flex-1 justify-end">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Rechercher"
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
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
            <Link
              href="/account"
              className="group relative text-[11px] font-normal tracking-[0.15em] uppercase"
            >
              Compte
              <span className="absolute -bottom-0.5 left-0 w-full h-px bg-current scale-x-0 origin-right transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:origin-left group-hover:scale-x-100" />
            </Link>
            <button
              onClick={openDrawer}
              className="group relative text-[11px] font-normal tracking-[0.15em] uppercase"
            >
              Panier{cartCount > 0 && ` (${cartCount})`}
              <span className="absolute -bottom-0.5 left-0 w-full h-px bg-current scale-x-0 origin-right transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:origin-left group-hover:scale-x-100" />
            </button>
          </div>

          {/* Mobile RIGHT: Cart only */}
          <div className="lg:hidden flex items-center ml-auto">
            <CartIcon />
          </div>
        </div>

        {/* Mega menu — natural child so onMouseLeave covers both navbar + panel */}
        <MegaMenu
          categories={activeCategories}
          collections={activeCollections}
          isOpen={megaMenuOpen}
          onClose={closeMegaMenu}
        />
      </header>

      {/* Cart drawer */}
      <CartDrawer />

      {/* Search overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} categories={activeCategories} />

      {/* Mobile menu */}
      <MobileMenu
        categories={activeCategories}
        collections={activeCollections}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Spacer for non-home pages */}
      {!isOverlay && <div className="h-16" />}
    </>
  )
}
