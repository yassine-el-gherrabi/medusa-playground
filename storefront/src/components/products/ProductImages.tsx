"use client"

import { useState } from "react"
import Image from "next/image"

export default function ProductImages({ images }: { images: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        Pas d&apos;image
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
        <Image
          src={images[selectedIndex]?.url}
          alt="Image du produit"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image: any, index: number) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                index === selectedIndex ? "border-black" : "border-transparent hover:border-border"
              }`}
            >
              <Image
                src={image.url}
                alt={`Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
