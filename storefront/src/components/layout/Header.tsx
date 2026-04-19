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
const SCROLL_DELTA_MIN = 5

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
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
  const [scrolledPastHero, setScrolledPastHero] = useState(false)

  const lastScrollY = useRef(0)
  const headerOffset = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const rafId = useRef(0)
  const heroObserverRef = useRef<IntersectionObserver | null>(null)

  // ── Observe [data-header-theme="dark"] to detect scroll-past-hero ──
  useEffect(() => {
    function observe() {
      if (heroObserverRef.current) heroObserverRef.current.disconnect()

      const heroEl = document.querySelector('[data-header-theme="dark"]')
      if (!heroEl) {
        setScrolledPastHero(false)
        return
      }

      heroObserverRef.current = new IntersectionObserver(
        ([entry]) => setScrolledPastHero(!entry.isIntersecting),
        { threshold: 0, rootMargin: `-${HEADER_H}px 0px 0px 0px` }
      )
      heroObserverRef.current.observe(heroEl)
    }

    // MutationObserver to re-scan when DOM settles after route change
    const mutationObserver = new MutationObserver(() => observe())
    mutationObserver.observe(document.body, { childList: true, subtree: false })
    observe()

    return () => {
      mutationObserver.disconnect()
      if (heroObserverRef.current) heroObserverRef.current.disconnect()
    }
  }, [pathname])

  // ── Scroll: hide/show with rAF throttle ──
  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        const currentY = window.scrollY
        const delta = currentY - lastScrollY.current

        if (Math.abs(delta) >= SCROLL_DELTA_MIN) {
          headerOffset.current = delta > 0
            ? Math.max(-HEADER_H, headerOffset.current - delta)
            : Math.min(0, headerOffset.current - delta)

          if (currentY <= 0) headerOffset.current = 0

          if (headerRef.current) {
            headerRef.current.style.transform = `translate3d(0,${headerOffset.current}px,0)`
          }

          lastScrollY.current = currentY
        }
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  // ── Mega menu keyboard + route close ──
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

  const scrollClass = scrolledPastHero ? "header-scrolled" : ""
  const menuClass = megaMenuOpen ? "header-menu-open" : ""

  return (
    <>
      <header
        ref={headerRef}
        role="banner"
        onMouseLeave={closeMegaMenu}
        className={`site-header fixed top-0 left-0 right-0 z-30 transition-colors duration-300 ease-out ${scrollClass} ${menuClass}`}
      >
        <nav className="h-16 px-6 lg:px-10 flex items-center" aria-label="Navigation principale">
          {/* Mobile LEFT: Burger only */}
          <div className="lg:hidden flex items-center">
            <button className="p-2 -ml-2 hover:opacity-70" onClick={() => setMobileMenuOpen(true)} aria-label="Ouvrir le menu">
              <div className="flex flex-col gap-[5px]">
                <span className="block w-5 h-[1px] bg-current" />
                <span className="block w-3.5 h-[1px] bg-current" />
              </div>
            </button>
          </div>

          {/* Desktop LEFT: Nav */}
          <div className="hidden lg:flex items-center gap-12 flex-1">
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
          </div>

          {/* CENTER: Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center lg:relative absolute left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0" aria-label="Ice Industry — Accueil">
            <Logo className="h-24 w-auto" />
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
            <button onClick={openDrawer} className="group relative text-[11px] font-normal tracking-[0.15em] uppercase" aria-label={`Panier${cartCount > 0 ? `, ${cartCount} articles` : ""}`}>
              Panier{cartCount > 0 && ` (${cartCount})`}
              <span className="absolute -bottom-0.5 left-0 w-full h-px bg-current scale-x-0 origin-right transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:origin-left group-hover:scale-x-100" />
            </button>
          </div>

          {/* Mobile RIGHT: Search + Cart */}
          <div className="lg:hidden flex items-center gap-2 ml-auto">
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:opacity-70 cursor-pointer" aria-label="Rechercher">
              <SearchIcon />
            </button>
            <button onClick={openDrawer} className="relative p-2 hover:opacity-70" aria-label={`Panier${cartCount > 0 ? `, ${cartCount} articles` : ""}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 -right-1 text-[10px] font-medium leading-none">{cartCount}</span>
              )}
            </button>
          </div>
        </nav>

        <MegaMenu categories={categories} collections={collections} isOpen={megaMenuOpen} onClose={closeMegaMenu} />
      </header>

      <CartDrawer />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} categories={categories} />
      <MobileMenu categories={categories} collections={collections} isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
