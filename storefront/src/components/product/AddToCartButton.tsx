"use client"

type AddToCartButtonProps = {
  onClick?: (() => void) | undefined
  adding: boolean
  added: boolean
  canAdd: boolean
  label: string
  fallbackLabel?: string
  price?: string | null
  size?: "default" | "small"
  className?: string
  disabled?: boolean
}

export default function AddToCartButton({
  onClick,
  adding,
  added,
  canAdd,
  label,
  fallbackLabel = "Sélectionner une taille",
  price,
  size = "default",
  className = "",
  disabled = false,
}: AddToCartButtonProps) {
  const height = size === "small" ? "h-[40px]" : "h-[52px]"
  const text = adding ? "Ajout..." : added ? "Ajouté ✓" : canAdd ? label : fallbackLabel

  return (
    <button
      onClick={onClick || undefined}
      aria-busy={adding}
      className={`w-full ${height} flex items-center justify-between px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all border-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
      style={{
        background: "var(--color-ink)",
        color: "var(--color-surface)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span>{text}</span>
      {price && <span className="tracking-[0.04em]">{price}</span>}
    </button>
  )
}
