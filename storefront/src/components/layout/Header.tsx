"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { sdk } from "@/lib/sdk"
import CartIcon from "./CartIcon"
import MegaMenu from "./MegaMenu"
import MobileMenu from "./MobileMenu"
import SearchOverlay from "./SearchOverlay"
import AccountIcon from "./AccountIcon"

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

type NavItem = {
  label: string
  href: string
  megaMenuKey?: string
}

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [activeNav, setActiveNav] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleNavEnter = useCallback((key: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setActiveNav(key)
  }, [])

  const handleNavLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveNav(null)
    }, 150)
  }, [])

  const handleMegaEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handleMegaLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveNav(null)
    }, 150)
  }, [])

  useEffect(() => {
    sdk.store.category
      .list({
        fields: "*category_children",
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Find newest collection
  const latestCollection = collections.length > 0
    ? collections.reduce((latest, c) =>
        new Date(c.created_at || 0) > new Date(latest.created_at || 0) ? c : latest
      )
    : null

  // Build nav items
  const navItems: NavItem[] = []
  if (latestCollection) {
    navItems.push({
      label: "Nouvelle Collection",
      href: `/collections/${latestCollection.handle}`,
    })
  }
  navItems.push({
    label: "Vetements",
    href: "/voir-tout",
    megaMenuKey: "vetements",
  })
  const accessoires = categories.find((c) => c.handle === "accessoires")
  if (accessoires) {
    navItems.push({
      label: "Accessoires",
      href: "/accessoires",
      megaMenuKey: "accessoires",
    })
  }
  const chaussures = categories.find((c) => c.handle === "chaussures")
  if (chaussures) {
    navItems.push({
      label: "Chaussures",
      href: "/categories/chaussures",
      megaMenuKey: "chaussures",
    })
  }
  const iceForGirls = categories.find((c) => c.handle === "ice-for-girls")
  if (iceForGirls) {
    navItems.push({
      label: "Ice for Girls",
      href: "/ice-for-girls",
    })
  }

  const transparent = isHome && !scrolled && !activeNav
  const headerBg = transparent ? "bg-transparent" : "bg-white"
  const borderStyle = transparent ? "border-transparent" : "border-border"
  const textColor = transparent ? "text-white" : "text-foreground"

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-colors duration-300 ${headerBg} border-b ${borderStyle} ${textColor}`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-2 hover:opacity-70"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Logo — left aligned */}
          <Link href="/" className="text-xl font-bold tracking-[0.3em] uppercase mr-8 hidden lg:block">
            Ice Industry
          </Link>

          {/* Mobile center logo */}
          <div className="flex-1 flex justify-center lg:hidden">
            <Link href="/" className="text-xl font-bold tracking-[0.3em] uppercase">
              Ice Industry
            </Link>
          </div>

          {/* Desktop center nav — category links */}
          <nav className="hidden lg:flex items-center gap-6 flex-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.megaMenuKey ? handleNavEnter(item.megaMenuKey) : handleNavLeave()}
                onMouseLeave={handleNavLeave}
              >
                <Link
                  href={item.href}
                  className="text-sm font-medium tracking-wide uppercase hover:opacity-70 transition-opacity"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:opacity-70 transition-opacity hidden lg:block"
              aria-label="Rechercher"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            <AccountIcon />
            <CartIcon />
          </div>
        </div>

        {/* Mega menu dropdown */}
        <div
          onMouseEnter={handleMegaEnter}
          onMouseLeave={handleMegaLeave}
        >
          <MegaMenu
            categories={categories}
            collections={collections}
            isOpen={activeNav !== null}
            activeSection={activeNav}
            onClose={() => setActiveNav(null)}
          />
        </div>

        {/* Mobile menu */}
        <MobileMenu
          categories={categories}
          collections={collections}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </header>

      {/* Search overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Spacer so content doesn't go under fixed header */}
      <div className="h-16" />
    </>
  )
}
