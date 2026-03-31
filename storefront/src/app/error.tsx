"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Une erreur est survenue
      </h1>
      <p className="mt-4 text-muted-foreground">
        {error.message || "Veuillez réessayer."}
      </p>
      <button
        onClick={reset}
        className="mt-8 border border-foreground px-6 py-3 text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
      >
        Réessayer
      </button>
    </div>
  )
}
