"use client"

import Link from "next/link"

type Category = {
  id: string
  name: string
  handle: string
}

export default function SearchCategories({
  categories,
  onClose,
}: {
  categories: Category[]
  onClose: () => void
}) {
  if (categories.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-[11px] font-normal tracking-[0.15em] uppercase text-muted-foreground mb-3">
        Catégories
      </h3>
      <ul className="space-y-1">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/categories/${cat.handle}`}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors group"
            >
              <span>{cat.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
