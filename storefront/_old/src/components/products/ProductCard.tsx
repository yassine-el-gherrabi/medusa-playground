import Link from "next/link"
import Image from "next/image"
import { formatPrice, getProductPrice } from "@/lib/utils"

export default function ProductCard({ product }: { product: any }) {
  const price = getProductPrice(product)
  const thumbnail = product.thumbnail || product.images?.[0]?.url

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Pas d&apos;image
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground group-hover:text-foreground/70 transition-colors truncate">
          {product.title}
        </h3>
        {price && (
          <p className="text-sm text-muted-foreground">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        )}
      </div>
    </Link>
  )
}
