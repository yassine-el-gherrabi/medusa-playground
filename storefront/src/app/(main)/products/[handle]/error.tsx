"use client"

export default function ProductError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <h1 className="text-[15px] font-medium uppercase tracking-[0.15em] mb-4">
        Une erreur est survenue
      </h1>
      <p className="text-[13px] text-muted-foreground mb-8 max-w-md">
        Impossible de charger ce produit. Veuillez réessayer.
      </p>
      <button
        onClick={reset}
        className="h-[44px] px-8 bg-foreground text-background text-[11px] font-medium uppercase tracking-[0.15em] hover:bg-foreground/90 transition-colors cursor-pointer"
      >
        Réessayer
      </button>
    </div>
  )
}
