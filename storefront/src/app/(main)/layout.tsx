import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getCategories } from "@/lib/medusa/categories"
import { getCollections } from "@/lib/medusa/collections"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [categories, collections] = await Promise.all([
    getCategories().catch(() => []),
    getCollections().catch(() => []),
  ])

  return (
    <>
      <Header categories={categories} collections={collections} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
