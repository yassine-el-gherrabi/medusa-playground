"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import type { Product } from "@/types"
import ProductCard from "@/components/product/ProductCard"

export default function NouveautesSection({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [barVisible, setBarVisible] = useState(false)
  const barTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const maxScroll = scrollWidth - clientWidth
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0)
    setBarVisible(true)
    if (barTimeout.current) clearTimeout(barTimeout.current)
    barTimeout.current = setTimeout(() => setBarVisible(false), 1500)
  }, [])

  if (products.length === 0) return null

  const thumbRatio = scrollRef.current
    ? scrollRef.current.clientWidth / scrollRef.current.scrollWidth
    : 0.3

  return (
    <section ref={sectionRef} className="bg-white">
      <div className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Header */}
        <div className="px-6 md:px-10 pt-8 md:pt-12 pb-5 md:pb-6">
          <h2 className="text-sm font-medium uppercase tracking-[0.15em]">Nouveautés</h2>
        </div>

        {/* Carousel */}
        <div
          onMouseEnter={() => setBarVisible(true)}
          onMouseLeave={() => { barTimeout.current = setTimeout(() => setBarVisible(false), 800) }}
        >
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[calc(100%/2.15)] md:w-[calc(100%/4)] lg:w-[calc(100%/5.5)]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Scroll progress bar */}
          <div className={`mx-0 mt-4 transition-opacity duration-300 ${barVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="relative" style={{ height: "1px" }}>
              <div
                className="absolute top-0 left-0 h-full bg-foreground will-change-transform"
                style={{
                  width: `${Math.max(thumbRatio * 100, 10)}%`,
                  transform: `translateX(${scrollProgress * ((1 / Math.max(thumbRatio, 0.1)) - 1) * 100}%)`,
                  transition: "transform 0.05s linear",
                }}
              />
            </div>
          </div>
        </div>

        {/* "Voir tout" */}
        <div className="flex justify-center py-8 md:py-10">
          <Link href="/boutique" className="text-[11px] font-medium uppercase tracking-[0.15em] group relative">
            <span className="relative">
              Voir tout
              <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current origin-right transition-transform duration-300 group-hover:scale-x-0" />
              <span className="absolute left-0 right-0 bottom-[-2px] h-px bg-current scale-x-0 origin-left transition-transform duration-300 delay-200 group-hover:scale-x-100" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
