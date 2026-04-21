"use client"

import { useState, useCallback } from "react"
import { sdk } from "@/lib/sdk"
import type { Product } from "@/types"

import { PRODUCT_FIELDS } from "@/lib/medusa/products"

type FetchParams = {
  regionId: string
  limit: number
  offset?: number
  categoryId?: string[]
  collectionId?: string[]
  order?: string
}

export function useProductList(initial: { products: Product[]; count: number }) {
  const [products, setProducts] = useState<Product[]>(initial.products)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(
    initial.products.length < initial.count
  )
  const [error, setError] = useState("")

  const fetchProducts = useCallback(async (params: FetchParams) => {
    setLoading(true)
    setOffset(0)
    setHasMore(true)
    setError("")

    try {
      const query: Record<string, unknown> = {
        limit: params.limit,
        offset: 0,
        region_id: params.regionId,
        fields: PRODUCT_FIELDS,
      }
      if (params.categoryId) query.category_id = params.categoryId
      if (params.collectionId) query.collection_id = params.collectionId
      if (params.order) query.order = params.order

      const { products, count } = await sdk.store.product.list(query)
      setProducts((products as Product[]) || [])
      setHasMore((products?.length || 0) < (count || 0))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les produits."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(
    async (params: FetchParams) => {
      if (!hasMore || loadingMore) return
      setLoadingMore(true)

      const nextOffset = offset + params.limit
      try {
        const query: Record<string, unknown> = {
          limit: params.limit,
          offset: nextOffset,
          region_id: params.regionId,
          fields: PRODUCT_FIELDS,
        }
        if (params.categoryId) query.category_id = params.categoryId
        if (params.collectionId) query.collection_id = params.collectionId
        if (params.order) query.order = params.order

        const { products: newProducts, count } =
          await sdk.store.product.list(query)
        setProducts((prev) => [
          ...prev,
          ...((newProducts as Product[]) || []),
        ])
        setOffset(nextOffset)
        setHasMore(nextOffset + params.limit < (count || 0))
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger plus de produits."
        )
      } finally {
        setLoadingMore(false)
      }
    },
    [hasMore, loadingMore, offset]
  )

  return { products, loading, loadingMore, hasMore, error, fetchProducts, loadMore }
}
