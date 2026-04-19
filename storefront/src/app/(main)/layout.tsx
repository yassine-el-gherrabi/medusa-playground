import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getCategories } from "@/lib/medusa/categories"
import { getCollections } from "@/lib/medusa/collections"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [categories, rawCollections] = await Promise.all([
    getCategories().catch(() => []),
    getCollections().catch(() => []),
  ])

  // Sort collections once (newest first) — children don't need to re-sort
  const collections = [...rawCollections].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  )

  return (
    <>
      <main className="flex-1 pt-16">{children}</main>
      <Header categories={categories} collections={collections} />
      <Footer />
    </>
  )
}
