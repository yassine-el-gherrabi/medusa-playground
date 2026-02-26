import { useMemo } from "react"

const POPULAR_TERMS = [
  "t-shirt",
  "hoodie",
  "veste",
  "pantalon",
  "casquette",
  "sneakers",
  "jean",
  "manteau",
  "sweat",
  "short",
  "chemise",
  "pull",
  "jogging",
  "doudoune",
  "cargo",
]

type Category = {
  id: string
  name: string
  handle: string
  category_children?: Category[]
}

export function useSearchSuggestions(
  query: string,
  categories: Category[]
) {
  const suggestions = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return POPULAR_TERMS.filter((term) => term.includes(q)).slice(0, 5)
  }, [query])

  const matchingCategories = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []

    const matches: Category[] = []
    for (const cat of categories) {
      if (cat.name.toLowerCase().includes(q)) {
        matches.push(cat)
      }
      if (cat.category_children) {
        for (const child of cat.category_children) {
          if (child.name.toLowerCase().includes(q)) {
            matches.push(child)
          }
        }
      }
    }
    return matches.slice(0, 4)
  }, [query, categories])

  return { suggestions, matchingCategories }
}
