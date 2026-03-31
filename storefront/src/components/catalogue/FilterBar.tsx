"use client"

import { cn } from "@/lib/utils"
import type { Category, Collection } from "@/types"

export default function FilterBar({
  categories,
  collections,
  selectedCategory,
  selectedCollection,
  onCategoryChange,
  onCollectionChange,
  sortOrder,
  onSortChange,
}: {
  categories: Category[]
  collections: Collection[]
  selectedCategory: string
  selectedCollection: string
  onCategoryChange: (handle: string) => void
  onCollectionChange: (handle: string) => void
  sortOrder: string
  onSortChange: (order: string) => void
}) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Row 1: Categories + Sort */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange("")}
            className={cn(
              "px-4 py-2 text-sm rounded-full border transition-colors",
              selectedCategory === ""
                ? "bg-black text-white border-black"
                : "border-border text-muted-foreground hover:border-black hover:text-foreground"
            )}
          >
            Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.handle)}
              className={cn(
                "px-4 py-2 text-sm rounded-full border transition-colors",
                selectedCategory === cat.handle
                  ? "bg-black text-white border-black"
                  : "border-border text-muted-foreground hover:border-black hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-muted border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
        >
          <option value="created_at">Nouveautés</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="title">Alphabétique</option>
        </select>
      </div>

      {/* Row 2: Collections */}
      {collections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCollectionChange("")}
            className={cn(
              "px-4 py-2 text-sm rounded-full border transition-colors",
              selectedCollection === ""
                ? "bg-black text-white border-black"
                : "border-border text-muted-foreground hover:border-black hover:text-foreground"
            )}
          >
            Toutes les collections
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => onCollectionChange(col.handle)}
              className={cn(
                "px-4 py-2 text-sm rounded-full border transition-colors",
                selectedCollection === col.handle
                  ? "bg-black text-white border-black"
                  : "border-border text-muted-foreground hover:border-black hover:text-foreground"
              )}
            >
              {col.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
