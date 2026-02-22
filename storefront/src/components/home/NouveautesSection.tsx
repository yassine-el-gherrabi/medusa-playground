"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { sdk } from "@/lib/sdk"
import { useRegion } from "@/providers/region"
import ProductCard from "@/components/products/ProductCard"

const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    title: "Hoodie Nebula Black",
    handle: "hoodie-nebula-black",
    thumbnail: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 89.99, currency_code: "eur" } }],
  },
  {
    id: "demo-2",
    title: "Cargo Pants Urban",
    handle: "cargo-pants-urban",
    thumbnail: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 74.99, currency_code: "eur" } }],
  },
  {
    id: "demo-3",
    title: "Tee Oversize Ice Logo",
    handle: "tee-oversize-ice-logo",
    thumbnail: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 44.99, currency_code: "eur" } }],
  },
  {
    id: "demo-4",
    title: "Bomber Jacket Street",
    handle: "bomber-jacket-street",
    thumbnail: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    variants: [{ calculated_price: { calculated_amount: 129.99, currency_code: "eur" } }],
  },
]

function DemoProductCard({ product }: { product: (typeof DEMO_PRODUCTS)[0] }) {
  const price = product.variants[0]?.calculated_price
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground group-hover:text-foreground/70 transition-colors truncate">
          {product.title}
        </h3>
        {price && (
          <p className="text-sm text-muted-foreground">
            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: price.currency_code }).format(price.calculated_amount)}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function NouveautesSection() {
  const { region } = useRegion()
  const [products, setProducts] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!region?.id) {
      setLoaded(true)
      return
    }
    sdk.store.product
      .list({
        limit: 8,
        order: "-created_at",
        region_id: region.id,
        fields: "*variants,*variants.calculated_price",
      })
      .then(({ products }) => {
        setProducts(products)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [region?.id])

  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const useDemo = loaded && products.length === 0
  const data = useDemo ? DEMO_PRODUCTS : products

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-white"
    >
      <div
        className={`max-w-7xl mx-auto px-6 md:px-10 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Section header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Explore
          </p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">
              Nouveautés
            </h2>
            <Link
              href="/voir-tout"
              className="text-xs font-medium uppercase tracking-[0.2em] hover:opacity-60 transition-opacity hidden md:block"
            >
              Voir tout
            </Link>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {useDemo
            ? data.map((product: any) => (
                <DemoProductCard key={product.id} product={product} />
              ))
            : data.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {/* Mobile "Voir tout" */}
        <div className="mt-10 md:hidden">
          <Link
            href="/voir-tout"
            className="text-xs font-medium uppercase tracking-[0.2em] hover:opacity-60 transition-opacity"
          >
            Voir tout
          </Link>
        </div>
      </div>
    </section>
  )
}
