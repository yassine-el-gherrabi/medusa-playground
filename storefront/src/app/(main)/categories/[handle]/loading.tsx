import { ProductGridSkeleton } from "@/components/ui/Skeleton"

export default function CategoryLoading() {
  return (
    <div className="animate-fade-in">
      <div className="h-[70vh] md:h-[80vh] bg-muted animate-shimmer" />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}
