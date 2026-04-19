import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductByHandle } from "@/lib/medusa/products"
import { DEFAULT_REGION, SITE_URL } from "@/lib/constants"
import ProductDetail from "./ProductDetail"
import type { Product as SchemaProduct, WithContext } from "schema-dts"

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle, DEFAULT_REGION)

  if (!product) return { title: "Produit introuvable" }

  const price = product.variants?.[0]?.calculated_price
  const priceText = price?.calculated_amount != null && price.currency_code
    ? `${price.calculated_amount} ${price.currency_code.toUpperCase()}`
    : ""

  return {
    title: product.title,
    description: product.description?.slice(0, 160) || `${product.title} — Ice Industry`,
    openGraph: {
      title: product.title,
      description: product.description || undefined,
      images: product.thumbnail ? [{ url: product.thumbnail }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title}${priceText ? ` — ${priceText}` : ""}`,
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/products/${handle}`,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const product = await getProductByHandle(handle, DEFAULT_REGION)

  if (!product) notFound()

  // JSON-LD structured data for Google
  const variant = product.variants?.[0]
  const price = variant?.calculated_price

  const jsonLd: WithContext<SchemaProduct> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images?.map((img) => img.url) || [],
    description: product.description || undefined,
    sku: variant?.sku || undefined,
    offers: price?.calculated_amount != null
      ? {
          "@type": "Offer",
          price: price.calculated_amount,
          priceCurrency: price.currency_code?.toUpperCase() || "EUR",
          availability:
            (variant?.inventory_quantity ?? 0) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/products/${product.handle}`,
        }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail product={product} />
    </>
  )
}
