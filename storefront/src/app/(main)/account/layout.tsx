"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { getCustomer } from "@/lib/medusa/customer"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Mon compte", href: "/account" },
  { label: "Commandes", href: "/account/orders" },
]

const PUBLIC_PATHS = ["/account/login", "/account/register"]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  const isPublic = PUBLIC_PATHS.includes(pathname)

  useEffect(() => {
    let cancelled = false
    getCustomer()
      .then((c) => {
        if (cancelled) return
        if (!c && !isPublic) router.replace("/account/login")
      })
      .catch(() => {
        if (!cancelled && !isPublic) router.replace("/account/login")
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [pathname, isPublic, router])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  if (isPublic) {
    return <div className="min-h-[60vh]">{children}</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light tracking-wide mb-10">Mon Compte</h1>

      <div className="flex flex-col md:flex-row gap-10">
        <nav className="md:w-48 shrink-0 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block py-2 text-sm transition-colors",
                pathname === item.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
