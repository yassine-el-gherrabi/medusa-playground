import ProductCard from "./ProductCard"
import { ProductGridSkeleton } from "@/components/ui/Skeleton"

export default function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
}: {
  products: any[]
  loading?: boolean
  skeletonCount?: number
}) {
  if (loading) {
    return <ProductGridSkeleton count={skeletonCount} />
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun produit trouve.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
