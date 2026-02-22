"use client"

import Link from "next/link"
import Image from "next/image"

const HERO_IMAGE = "https://images.unsplash.com/photo-1752674316405-549b77559eb3?w=1920&q=80"

export default function HeroSection({ latestCollectionHandle }: { latestCollectionHandle?: string }) {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden -mt-16">
      {/* Full-bleed background with Ken Burns */}
      <div className="absolute inset-0 animate-ken-burns">
        <Image
          src={HERO_IMAGE}
          alt="Ice Industry"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content — centered, minimal */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 uppercase">
          Drop Capsule 01
        </h1>
        <Link
          href={latestCollectionHandle ? `/collections/${latestCollectionHandle}` : "/voir-tout"}
          className="inline-block bg-white text-black px-10 py-4 text-xs font-medium uppercase tracking-[0.25em] hover:bg-white/90 transition-colors"
        >
          Decouvrir
        </Link>
      </div>

      {/* Minimal scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-px h-12 bg-white/30" />
      </div>
    </section>
  )
}
