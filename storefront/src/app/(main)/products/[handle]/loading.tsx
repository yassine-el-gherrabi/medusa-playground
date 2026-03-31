import { Skeleton } from "@/components/ui/Skeleton"

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <Skeleton variant="image" className="aspect-square w-full" />
        <div className="space-y-6">
          <Skeleton variant="text" className="h-8 w-3/4" />
          <Skeleton variant="text" className="h-6 w-1/4" />
          <Skeleton variant="text" className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton variant="button" className="w-16" />
            <Skeleton variant="button" className="w-16" />
            <Skeleton variant="button" className="w-16" />
          </div>
          <Skeleton variant="button" className="w-full h-12" />
        </div>
      </div>
    </div>
  )
}
