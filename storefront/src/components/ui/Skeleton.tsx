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
  const base = "animate-shimmer-bg rounded"

  const variants: Record<SkeletonVariant, string> = {
    text: "h-4 w-full",
    card: "h-64 w-full rounded-lg",
    image: "aspect-[3/4] w-full",
    circle: "h-10 w-10 rounded-full",
    button: "h-12 w-full",
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
    <div>
      <div className="aspect-[3/4] w-full animate-shimmer-bg" />
      <div className="pt-3 px-1 space-y-2">
        <div className="h-3 w-3/4 animate-shimmer-bg rounded" />
        <div className="h-3 w-1/4 animate-shimmer-bg rounded" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8, cols = 4 }: { count?: number; cols?: number }) {
  const colsClass = cols === 3 ? "grid-cols-2 lg:grid-cols-3" : cols === 6 ? "grid-cols-3 lg:grid-cols-6" : "grid-cols-2 lg:grid-cols-4"
  return (
    <div className={`grid ${colsClass} gap-0.5`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ── Page-level skeletons ──

export function HeroSkeleton() {
  return (
    <div className="-mt-16 h-[480px] lg:h-[620px] bg-[var(--color-ink)] animate-shimmer-bg" />
  )
}

export function FilterBarSkeleton() {
  return (
    <div className="border-b border-[var(--color-border)] bg-white px-5 lg:px-8 py-4 lg:py-5 flex justify-between items-center">
      <div className="flex items-center gap-5">
        <div className="h-4 w-20 animate-shimmer-bg rounded" />
        <div className="hidden lg:block h-3 w-16 animate-shimmer-bg rounded" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-5 w-14 animate-shimmer-bg rounded" />
        <div className="h-4 w-24 animate-shimmer-bg rounded" />
      </div>
    </div>
  )
}

export function ManifestoSkeleton() {
  return (
    <div className="border-b border-[var(--color-border)] py-[60px] lg:py-[120px] px-5 lg:px-16">
      <div className="hidden lg:grid grid-cols-[280px_1fr] gap-20">
        <div className="space-y-4">
          <div className="h-3 w-20 animate-shimmer-bg rounded" />
          <div className="h-6 w-48 animate-shimmer-bg rounded" />
          <div className="h-3 w-full animate-shimmer-bg rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-24 animate-shimmer-bg rounded" />
          <div className="h-4 w-full animate-shimmer-bg rounded" />
          <div className="h-4 w-full animate-shimmer-bg rounded" />
          <div className="h-4 w-3/4 animate-shimmer-bg rounded" />
        </div>
      </div>
      <div className="lg:hidden space-y-4">
        <div className="h-3 w-20 animate-shimmer-bg rounded" />
        <div className="h-6 w-48 animate-shimmer-bg rounded" />
        <div className="h-4 w-full animate-shimmer-bg rounded" />
        <div className="h-4 w-full animate-shimmer-bg rounded" />
      </div>
    </div>
  )
}

// ── Composed page skeletons ──

export function CollectionPageSkeleton() {
  return (
    <div className="animate-fade-in">
      <HeroSkeleton />
      <ManifestoSkeleton />
      <div className="px-5 lg:px-8 py-7 lg:py-12">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}

export function BoutiquePageSkeleton() {
  return (
    <div className="animate-fade-in">
      <HeroSkeleton />
      <FilterBarSkeleton />
      <div className="px-5 lg:px-8 py-7 lg:py-12">
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  )
}

export function CategoryPageSkeleton() {
  return (
    <div className="animate-fade-in">
      <HeroSkeleton />
      <div className="px-5 lg:px-8 py-7 lg:py-12">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}
