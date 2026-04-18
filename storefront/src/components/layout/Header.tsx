"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/providers/CartProvider"
import type { Category, Collection } from "@/types"
import CartDrawer from "@/components/cart/CartDrawer"
import MegaMenu from "./MegaMenu"
import MobileMenu from "./MobileMenu"
import SearchOverlay from "./SearchOverlay"
import Logo from "./Logo"

const HEADER_H = 64
const SCROLL_THRESHOLD = 10 // px — minimal scroll to trigger solid background

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

/**
 * Header algorithm:
 *
 * 1. BACKGROUND
 *    - scroll === 0: always transparent (content behind determines visual)
 *    - scroll > 0: solid white
 *
 * 2. TEXT COLOR
 *    - Pages with dark hero (homepage, collections, categories, boutique):
 *      white text when transparent, black when scrolled
 *    - All other pages: always black text
 *      (transparent header on white page background = black text is readable)
 *
 * 3. HIDE ON SCROLL
 *    - Scrolling down: header slides up (hides)
 *    - Scrolling up: header slides back down (shows)
 *
 * 4. NO SSR DEPENDENCY
 *    - The header renders identically on SSR and client at scroll=0
 *    - No usePathname() for layout decisions — avoids SSR mismatch
 *    - usePathname() only used for: text color (client-side only), mega menu close
 */

// Which pages have a dark hero behind the transparent header
const DARK_HERO_PAGES = [/^\/$/, /^\/collections\/.+/, /^\/boutique$/, /^\/categories\/.+/]

function isDarkHeroPage(pathname: string): boolean {
  return DARK_HERO_PAGES.some((re) => re.test(pathname))
}

export default function Header({
  categories,
  collections,
}: {
  categories: Category[]
  collections: Collection[]
}) {
  const pathname = usePathname()
  const { cart, openDrawer } = useCart()
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [atTop, setAtTop] = useState(true) // true = scroll is at/near top
  const lastScrollY = useRef(0)
  const headerOffset = useRef(0)
  const headerRef = useRef<HTMLElement>(null)

  // Scroll handler: detect top position + hide/show on scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current

      setAtTop(currentY <= SCROLL_THRESHOLD)

      // Hide on scroll down, show on scroll up
      headerOffset.current = Math.min(0, Math.max(-HEADER_H, headerOffset.current - delta))
      if (currentY <= 0) headerOffset.current = 0
      if (headerRef.current) {
        headerRef.current.style.transform = `translateY(${headerOffset.current}px)`
      }

      lastScrollY.current = currentY
    }

    // Set initial state
    setAtTop(window.scrollY <= SCROLL_THRESHOLD)

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mega menu on route change
  useEffect(() => { setMegaMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!megaMenuOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMegaMenuOpen(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [megaMenuOpen])

  const openMegaMenu = useCallback(() => setMegaMenuOpen(true), [])
  const closeMegaMenu = useCallback(() => setMegaMenuOpen(false), [])

  const latestCollection = collections.length > 0 ? collections[0] : null

  // Determine styling based on scroll + page type
  const isTransparent = atTop && !megaMenuOpen
  const darkHero = isDarkHeroPage(pathname)
  const useWhiteText = isTransparent && darkHero
  const bgClass = isTransparent ? "bg-transparent" : "bg-white"
  const textClass = useWhiteText ? "text-white" : "text-foreground"

  return (
    <>
      <header
        ref={headerRef}
        onMouseLeave={closeMegaMenu}
        className={`fixed top-0 left-0 right-0 z-30 transition-colors duration-200 ${bgClass} ${textClass}`}
      >
        <div className="h-16 px-6 lg:px-10 flex items-center">
          {/* Mobile LEFT: Burger + Search */}
          <div className="lg:hidden flex items-center gap-3">
            <button className="p-2 -ml-2 hover:opacity-70" onClick={() => setMobileMenuOpen(true)} aria-label="Menu">
              <div className="flex flex-col gap-[5px]">
                <span className="block w-5 h-[1px] bg-current" />
                <span className="block w-3.5 h-[1px] bg-current" />
              </div>
            </button>
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:opacity-70 cursor-pointer" aria-label="Rechercher">
              <SearchIcon />
            </button>
          </div>

          {/* Desktop LEFT: Nav */}
          <nav className="hidden lg:flex items-center gap-12 flex-1">
            <button onMouseEnter={openMegaMenu} className="group relative text-[11px] font-normal tracking-[0.15em] uppercase">
              Collections
              <span className={`absolute -bottom-0.5 left-0 w-full h-px bg-current transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${megaMenuOpen ? "scale-x-100 origin-left" : "scale-x-0 origin-right group-hover:origin-left group-hover:scale-x-100"}`} />
            </button>
            {latestCollection && (
              <Link href={`/collections/${latestCollection.handle}`} className="group relative text-[11px] font-normal tracking-[0.15em] uppercase">
                {latestCollection.title}
                <span className="absolute -bottom-0.5 left-0 w-full h-px bg-current scale-x-0 origin-right transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:origin-left group-hover:scale-x-100" />
              </Link>
            )}
          </nav>

          {/* CENTER: Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center lg:relative absolute left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0">
            <Logo className="h-24 w-auto" variant={useWhiteText ? "white" : "black"} />
          </Link>

          {/* Desktop RIGHT: Utilities */}
          <div className="hidden lg:flex items-center gap-12 flex-1 justify-end">
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:opacity-70 transition-opacity cursor-pointer" aria-label="Rechercher">
              <SearchIcon />
            </button>
            <Link href="/account" className="group relative text-[11px] font-normal tracking-[0.15em] uppercase">
              Compte
              <span className="absolute -bottom-0.5 left-0 w-full h-px bg-current scale-x-0 origin-right transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:origin-left group-hover:scale-x-100" />
            </Link>
            <button onClick={openDrawer} className="group relative text-[11px] font-normal tracking-[0.15em] uppercase">
              Panier{cartCount > 0 && ` (${cartCount})`}
              <span className="absolute -bottom-0.5 left-0 w-full h-px bg-current scale-x-0 origin-right transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:origin-left group-hover:scale-x-100" />
            </button>
          </div>

          {/* Mobile RIGHT: Cart */}
          <div className="lg:hidden flex items-center ml-auto">
            <button onClick={openDrawer} className="relative p-2 hover:opacity-70" aria-label="Panier">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 -right-1 text-[10px] font-medium leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <MegaMenu categories={categories} collections={collections} isOpen={megaMenuOpen} onClose={closeMegaMenu} />
      </header>

      <CartDrawer />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} categories={categories} />
      <MobileMenu categories={categories} collections={collections} isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
