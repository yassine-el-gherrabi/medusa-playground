import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Cette page n&apos;existe pas.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block border border-foreground px-6 py-3 text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
