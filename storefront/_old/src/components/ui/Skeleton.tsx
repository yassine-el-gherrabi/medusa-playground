import { cn } from "@/lib/utils"

type SkeletonVariant = "card" | "text" | "image" | "circle" | "button"

export function Skeleton({
  variant = "text",
  className,
  count = 1,
}: {
  variant?: SkeletonVariant
  className?: string
  count?: number
}) {
  const base = "animate-shimmer rounded"

  const variants: Record<SkeletonVariant, string> = {
    text: "h-4 w-full",
    card: "h-64 w-full rounded-lg",
    image: "aspect-square w-full rounded-lg",
    circle: "h-10 w-10 rounded-full",
    button: "h-12 w-full rounded-md",
  }

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={cn(base, variants[variant], className)} />
        ))}
      </div>
    )
  }

  return <div className={cn(base, variants[variant], className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton variant="image" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/4" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
