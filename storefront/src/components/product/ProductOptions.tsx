"use client"

import { cn } from "@/lib/utils"
import type { Product } from "@/types"

type ProductOptionsProps = {
  product: Product
  selectedOptions: Record<string, string>
  onOptionChange: (optionId: string, value: string) => void
}

const OPTION_LABELS: Record<string, string> = {
  Size: "Taille",
  Color: "Couleur",
  Material: "Matiere",
}

export default function ProductOptions({
  product,
  selectedOptions,
  onOptionChange,
}: ProductOptionsProps) {
  if (!product.options || product.options.length === 0) return null

  return (
    <div className="space-y-4">
      {product.options.map((option) => (
        <div key={option.id}>
          <label className="block text-sm font-medium text-foreground mb-2">
            {OPTION_LABELS[option.title] || option.title}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values?.map((value) => {
              const isSelected = selectedOptions[option.id] === value.value
              return (
                <button
                  key={value.id}
                  onClick={() => onOptionChange(option.id, value.value)}
                  className={cn(
                    "px-4 py-2 text-sm border rounded-md transition-colors min-w-[44px] min-h-[44px]",
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-border text-muted-foreground hover:border-black hover:text-foreground"
                  )}
                >
                  {value.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
