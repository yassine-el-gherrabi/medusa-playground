import Link from "next/link"
import Logo from "@/components/layout/Logo"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="h-16 px-6 lg:px-10 flex items-center justify-between border-b border-border">
        <Link href="/" className="flex items-center">
          <Logo className="h-12 w-auto" variant="black" />
        </Link>
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Retour à la boutique
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </>
  )
}
