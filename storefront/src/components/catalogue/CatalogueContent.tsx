"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRegion } from "@/providers/RegionProvider"
import { useProductList } from "@/hooks/useProductList"
import { useDensity } from "@/hooks/useDensity"
import CollectionFilterBar, {
  DEFAULT_FILTERS,
  type FilterState,
  type FilterOptions,
} from "@/components/catalogue/CollectionFilterBar"
import ProductGrid from "@/components/catalogue/ProductGrid"
import MidLayout from "@/components/catalogue/MidLayout"
import LookbookLayout from "@/components/catalogue/LookbookLayout"
import ShopTheShoot from "@/components/catalogue/ShopTheShoot"
import ProductCard from "@/components/product/ProductCard"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"
import { COLOR_MAP } from "@/lib/product-helpers"
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
  showFilters?: boolean
}

function getLayoutMode(count: number) {
  if (count >= 9) return "grid" as const
  if (count >= 4) return "mid" as const
  if (count >= 2) return "lookbook" as const
  return "special" as const
}

// ── Extract filter options from products ──

function buildFilterOptions(allProducts: Product[]): FilterOptions {
  // Categories
  const categories = [
    ...new Set(
      allProducts
        .flatMap((p) => (p.categories || []).map((c) => c.name))
        .filter(Boolean)
    ),
  ]

  // Size groups — group by product's primary category
  const sizeMap: Record<string, Set<string>> = {}
  allProducts.forEach((p) => {
    const catName = p.categories?.[0]?.name || "Autre"
    const sizeOpt = p.options?.find((o) =>
      ["taille", "size", "pointure"].includes(o.title?.toLowerCase() || "")
    )
    if (sizeOpt?.values) {
      if (!sizeMap[catName]) sizeMap[catName] = new Set()
      sizeOpt.values.forEach((v) => sizeMap[catName].add(v.value))
    }
  })
  const sizeGroups = Object.entries(sizeMap).map(([label, sizes]) => ({
    label,
    sizes: [...sizes],
  }))

  // Colors
  const colorSet = new Set<string>()
  allProducts.forEach((p) => {
    const colorOpt = p.options?.find((o) =>
      ["couleur", "color"].includes(o.title?.toLowerCase() || "")
    )
    colorOpt?.values?.forEach((v) => colorSet.add(v.value))
  })
  const colors = [...colorSet].map((name) => ({
    name,
    hex: COLOR_MAP[name] || "#ccc",
  }))

  // Price range
  const prices = allProducts.flatMap((p) =>
    (p.variants || [])
      .map((v) => v.calculated_price?.calculated_amount)
      .filter((x): x is number => x != null)
  )
  const priceRange: [number, number] =
    prices.length > 0
      ? [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
      : [0, 500]

  return { categories, sizeGroups, colors, priceRange }
}

// ── Client-side product filtering ──

function applyClientFilters(products: Product[], filters: FilterState, defaultPriceRange: [number, number]): Product[] {
  let result = products

  // Filter by category name
  if (filters.categories.length > 0) {
    result = result.filter((p) =>
      p.categories?.some((c) => filters.categories.includes(c.name))
    )
  }

  // Filter by size
  if (filters.sizes.length > 0) {
    result = result.filter((p) => {
      const sizeOpt = p.options?.find((o) =>
        ["taille", "size", "pointure"].includes(o.title?.toLowerCase() || "")
      )
      return sizeOpt?.values?.some((v) => filters.sizes.includes(v.value))
    })
  }

  // Filter by color
  if (filters.colors.length > 0) {
    result = result.filter((p) => {
      const colorOpt = p.options?.find((o) =>
        ["couleur", "color"].includes(o.title?.toLowerCase() || "")
      )
      return colorOpt?.values?.some((v) => filters.colors.includes(v.value))
    })
  }

  // Filter by price range
  if (
    filters.priceRange &&
    (filters.priceRange[0] !== defaultPriceRange[0] ||
      filters.priceRange[1] !== defaultPriceRange[1])
  ) {
    const [min, max] = filters.priceRange
    result = result.filter((p) => {
      const price = p.variants?.[0]?.calculated_price?.calculated_amount
      return price != null && price >= min && price <= max
    })
  }

  return result
}

function hasClientFilters(filters: FilterState, defaultPriceRange: [number, number]): boolean {
  return (
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.categories.length > 0 ||
    (filters.priceRange != null &&
      (filters.priceRange[0] !== defaultPriceRange[0] ||
        filters.priceRange[1] !== defaultPriceRange[1]))
  )
}

export default function CatalogueContent({
  initialProducts,
  initialCount,
  collectionId,
  categoryId,
  editorialBlocks,
  shootData,
  subcategories,
  showFilters = false,
}: CatalogueContentProps) {
  const { region } = useRegion()
  const [density, setDensity] = useDensity()
  const [sortOrder, setSortOrder] = useState("-created_at")
  const [activeSubcategory, setActiveSubcategory] = useState("")
  const [shootProducts, setShootProducts] = useState<Product[]>([])
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
  })
  // Track whether we've fetched all products for client filtering
  const [allProducts, setAllProducts] = useState<Product[] | null>(null)

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
    return () => {
      cancelled = true
    }
  }, [shootData, region?.id])

  const layoutMode = getLayoutMode(initialCount)

  const { products, loading, loadingMore, hasMore, fetchProducts, loadMore } =
    useProductList({ products: initialProducts, count: initialCount })

  // Extract filter options from initial products
  const filterOptions = useMemo(
    () => buildFilterOptions(initialProducts),
    [initialProducts]
  )

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

  // Fetch ALL products when client filters are active
  useEffect(() => {
    if (!region?.id) return
    if (!hasClientFilters(activeFilters, filterOptions.priceRange)) {
      setAllProducts(null)
      return
    }

    let cancelled = false
    const fetchAll = async () => {
      try {
        const query: Record<string, unknown> = {
          limit: 200,
          offset: 0,
          region_id: region.id,
          fields: PRODUCT_FIELDS,
          order: sortOrder,
        }
        if (collectionId) query.collection_id = [collectionId]
        if (activeSubcategory) {
          query.category_id = [activeSubcategory]
        } else if (categoryId) {
          query.category_id = [categoryId]
        }

        const { products: all } = await sdk.store.product.list(query)
        if (!cancelled) setAllProducts((all as Product[]) || [])
      } catch {
        // Fall back to current products on error
      }
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [
    region?.id,
    activeFilters,
    sortOrder,
    activeSubcategory,
    collectionId,
    categoryId,
    filterOptions.priceRange,
  ])

  // Re-fetch when sort or subcategory changes
  useEffect(() => {
    if (!region) return
    fetchProducts(buildParams())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, activeSubcategory, region])

  // Apply client-side filters
  const displayProducts = useMemo(() => {
    const useClientFilter = hasClientFilters(activeFilters, filterOptions.priceRange)
    const source = useClientFilter && allProducts ? allProducts : products
    if (!useClientFilter) return source
    return applyClientFilters(source, activeFilters, filterOptions.priceRange)
  }, [products, allProducts, activeFilters, filterOptions.priceRange])

  const handleSortChange = (order: string) => {
    setSortOrder(order)
    setActiveFilters((prev) => ({ ...prev, sort: order }))
  }

  const handleSubcategoryChange = (id: string) => {
    setActiveSubcategory(id)
  }

  const handleFiltersApply = useCallback(
    (filters: FilterState) => {
      setActiveFilters(filters)
      // Sync sort to API-level sort
      if (filters.sort !== sortOrder) {
        setSortOrder(filters.sort)
      }
    },
    [sortOrder]
  )

  const handleLoadMore = () => {
    if (!region) return
    loadMore(buildParams())
  }

  const editorialInsert = editorialBlocks?.[0]
  const displayCount = displayProducts.length
  const isClientFiltering = hasClientFilters(activeFilters, filterOptions.priceRange)

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

  // --- Layout: mid (4-8 products) ---
  if (layoutMode === "mid") {
    return (
      <>
        {showFilters && (
          <CollectionFilterBar
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            density={density}
            onDensityChange={setDensity}
            productCount={displayCount}
            filterOptions={filterOptions}
            activeFilters={activeFilters}
            onFiltersApply={handleFiltersApply}
          />
        )}
        <MidLayout products={displayProducts} density={density} />
        {shootSection}
      </>
    )
  }

  // --- Layout: grid (9+ products) ---
  return (
    <>
      {showFilters && (
        <CollectionFilterBar
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          density={density}
          onDensityChange={setDensity}
          subcategories={subcategories}
          activeSubcategory={activeSubcategory}
          onSubcategoryChange={handleSubcategoryChange}
          productCount={displayCount}
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onFiltersApply={handleFiltersApply}
        />
      )}
      {loading ? (
        <div className="px-5 lg:px-8 py-7 lg:py-12">
          <ProductGridSkeleton count={8} />
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-4">
            Aucun produit ne correspond à ces filtres
          </p>
          <button
            onClick={() => handleFiltersApply(DEFAULT_FILTERS)}
            className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-0.5 hover:opacity-70 transition-opacity bg-transparent border-t-0 border-x-0 cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <ProductGrid
          products={displayProducts}
          density={density}
          editorialInsert={editorialInsert}
          loadingMore={loadingMore}
          hasMore={!isClientFiltering && hasMore}
          onLoadMore={handleLoadMore}
        />
      )}
      {shootSection}
    </>
  )
}
