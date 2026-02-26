"use client"

function highlightMatch(text: string, query: string) {
  const q = query.toLowerCase().trim()
  if (!q) return text

  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-foreground">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  )
}

export default function SearchSuggestions({
  suggestions,
  query,
  activeIndex,
  onSelect,
}: {
  suggestions: string[]
  query: string
  activeIndex: number
  onSelect: (term: string) => void
}) {
  if (suggestions.length === 0) return null

  return (
    <div role="listbox" className="mb-6">
      <h3 className="text-[11px] font-normal tracking-[0.15em] uppercase text-muted-foreground mb-3">
        Suggestions
      </h3>
      <ul>
        {suggestions.map((term, i) => (
          <li key={term}>
            <button
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => onSelect(term)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                i === activeIndex
                  ? "bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-3.5 h-3.5 inline-block mr-2 text-muted-foreground"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span className="text-muted-foreground">
                {highlightMatch(term, query)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
