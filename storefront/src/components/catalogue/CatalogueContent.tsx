"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRegion } from "@/providers/RegionProvider"
import { useProductList } from "@/hooks/useProductList"
import { useDensity } from "@/hooks/useDensity"
import CollectionFilterBar from "@/components/catalogue/CollectionFilterBar"
import ProductGrid from "@/components/catalogue/ProductGrid"
import MidLayout from "@/components/catalogue/MidLayout"
import LookbookLayout from "@/components/catalogue/LookbookLayout"
import ShopTheShoot from "@/components/catalogue/ShopTheShoot"
import ProductCard from "@/components/product/ProductCard"
import { sdk } from "@/lib/sdk"
import { PRODUCT_FIELDS } from "@/lib/medusa/products"
import type { Product } from "@/types"
import type { ShootData } from "@/types/catalogue"

const LIMIT = 12

type CatalogueContentProps = {
  initialProducts: Product[]
  initialCount: number
  collectionId?: string
  categoryId?: string
  editorialBlocks?: { kicker: string; headline: string }[]
  shootData?: ShootData
  subcategories?: { id: string; handle: string; name: string }[]
}

function getLayoutMode(count: number) {
  if (count >= 9) return "grid" as const
  if (count >= 4) return "mid" as const
  if (count >= 2) return "lookbook" as const
  return "special" as const
}

export default function CatalogueContent({
  initialProducts,
  initialCount,
  collectionId,
  categoryId,
  editorialBlocks,
  shootData,
  subcategories,
}: CatalogueContentProps) {
  const { region } = useRegion()
  const [density, setDensity] = useDensity()
  const [sortOrder, setSortOrder] = useState("-created_at")
  const [activeSubcategory, setActiveSubcategory] = useState("")
  const [shootProducts, setShootProducts] = useState<Product[]>([])

  // Fetch shoot products when shootData is provided
  useEffect(() => {
    if (!shootData?.product_ids?.length || !region?.id) return
    let cancelled = false
    sdk.store.product
      .list({
        id: shootData.product_ids,
        fields: PRODUCT_FIELDS,
        limit: shootData.product_ids.length,
        region_id: region.id,
      })
      .then(({ products }) => {
        if (!cancelled) setShootProducts(products as Product[])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [shootData, region?.id])

  const layoutMode = getLayoutMode(initialCount)

  const { products, loading, loadingMore, hasMore, fetchProducts, loadMore } =
    useProductList({ products: initialProducts, count: initialCount })

  // Build fetch params
  const buildParams = useCallback(
    (overrides?: { order?: string; subCat?: string }) => {
      const order = overrides?.order ?? sortOrder
      const subCat = overrides?.subCat ?? activeSubcategory

      const params: {
        regionId: string
        limit: number
        collectionId?: string[]
        categoryId?: string[]
        order?: string
      } = {
        regionId: region?.id ?? "",
        limit: LIMIT,
        order,
      }

      if (collectionId) params.collectionId = [collectionId]

      // Use subcategory if active, otherwise fall back to categoryId
      if (subCat) {
        params.categoryId = [subCat]
      } else if (categoryId) {
        params.categoryId = [categoryId]
      }

      return params
    },
    [region?.id, sortOrder, activeSubcategory, collectionId, categoryId]
  )

  // Re-fetch when sort or subcategory changes
  useEffect(() => {
    if (!region) return
    fetchProducts(buildParams())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, activeSubcategory, region])

  const handleSortChange = (order: string) => {
    setSortOrder(order)
  }

  const handleSubcategoryChange = (id: string) => {
    setActiveSubcategory(id)
  }

  const handleLoadMore = () => {
    if (!region) return
    loadMore(buildParams())
  }

  const editorialInsert = editorialBlocks?.[0]

  // --- Layout: 0 products ---
  if (initialCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-6">
          Aucun produit dans cette collection
        </p>
        <Link
          href="/boutique"
          className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-0.5 hover:opacity-70 transition-opacity"
        >
          Découvrir la boutique
        </Link>
      </div>
    )
  }

  // --- Layout: 1 product ---
  if (initialCount === 1 && products.length > 0) {
    return (
      <div className="flex justify-center py-16 px-5">
        <div className="w-full max-w-sm">
          <ProductCard product={products[0]} />
        </div>
      </div>
    )
  }

  // Shared shoot section
  const shootSection =
    shootData && shootProducts.length > 0 ? (
      <ShopTheShoot shootData={shootData} products={shootProducts} />
    ) : null

  // --- Layout: lookbook (2-3 products) ---
  if (layoutMode === "lookbook") {
    return (
      <>
        <LookbookLayout products={products} />
        {shootSection}
      </>
    )
  }

  // --- Layout: mid (4-8 products) — filter bar sort only ---
  if (layoutMode === "mid") {
    return (
      <>
        <CollectionFilterBar
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          density={density}
          onDensityChange={setDensity}
          productCount={products.length}
        />
        <MidLayout products={products} density={density} />
        {shootSection}
      </>
    )
  }

  // --- Layout: grid (9+ products) ---
  return (
    <>
      <CollectionFilterBar
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        density={density}
        onDensityChange={setDensity}
        subcategories={subcategories}
        activeSubcategory={activeSubcategory}
        onSubcategoryChange={handleSubcategoryChange}
        productCount={products.length}
      />
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-5 w-5 border-2 border-[var(--color-border)] border-t-[var(--color-ink)] rounded-full animate-spin" />
        </div>
      ) : (
        <ProductGrid
          products={products}
          density={density}
          editorialInsert={editorialInsert}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      )}
      {shootSection}
    </>
  )
}
