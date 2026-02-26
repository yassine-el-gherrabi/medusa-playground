"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const LEGAL_LINKS = [
  { href: "/legal/confidentialite", label: "Politique de confidentialité" },
  { href: "/legal/cgv", label: "CGV" },
  { href: "/legal/cookies", label: "Politique de cookies" },
  { href: "/legal/nous-rejoindre", label: "Nous rejoindre" },
  { href: "/legal/partenariats", label: "Partenariats" },
  { href: "/legal/resell", label: "Resell" },
]

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <nav className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 px-3">
            Légal
          </p>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-3 py-2 text-sm rounded-md transition-colors",
                pathname === link.href
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="md:col-span-3 prose prose-sm max-w-none">
          {children}
        </div>
      </div>
    </div>
  )
}
