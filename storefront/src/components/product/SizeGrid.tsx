"use client"

type SizeGridProps = {
  sizes: { value: string; label: string }[]
  selected: string
  onSelect: (value: string) => void
  isInStock: (size: string) => boolean
}

export default function SizeGrid({ sizes, selected, onSelect, isInStock }: SizeGridProps) {
  const colCount = Math.min(sizes.length, 6)

  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
    >
      {sizes.map((s) => {
        const isSelected = selected === s.value
        const inStock = isInStock(s.value)
        return (
          <button
            key={s.value}
            onClick={() => inStock && onSelect(s.value)}
            disabled={!inStock}
            aria-label={`Taille ${s.value}`}
            className={`relative h-[46px] text-[13px] font-medium tracking-[0.02em] transition-all border cursor-pointer ${
              isSelected
                ? "bg-[var(--color-ink)] text-[var(--color-surface)] border-[var(--color-ink)]"
                : !inStock
                  ? "bg-transparent text-[var(--color-disabled)] border-[var(--color-border)] cursor-not-allowed"
                  : "bg-transparent text-[var(--color-ink)] border-[var(--color-border)] hover:border-[var(--color-ink)]"
            }`}
          >
            {s.value}
            {!inStock && (
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="100" y2="0" stroke="var(--color-border)" strokeWidth="1" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
