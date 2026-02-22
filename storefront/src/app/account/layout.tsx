"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/providers/auth"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/account", label: "Profil" },
  { href: "/account/addresses", label: "Adresses" },
  { href: "/account/orders", label: "Commandes" },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { customer, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname === "/account/login" || pathname === "/account/register"

  useEffect(() => {
    if (!loading && !customer && !isAuthPage) {
      router.push("/account/login")
    }
  }, [loading, customer, isAuthPage, router])

  if (isAuthPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
        <Skeleton variant="text" className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Skeleton variant="text" className="h-10 w-full" />
            <Skeleton variant="text" className="h-10 w-full" />
            <Skeleton variant="text" className="h-10 w-full" />
          </div>
          <div className="md:col-span-3">
            <Skeleton variant="card" className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Mon compte</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-3 text-sm rounded-md transition-colors",
                pathname === item.href
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={async () => {
              await logout()
              router.push("/")
            }}
            className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-red-400 transition-colors rounded-md"
          >
            Deconnexion
          </button>
        </nav>

        {/* Content */}
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  )
}
