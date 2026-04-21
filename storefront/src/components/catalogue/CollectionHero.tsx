import Image from "next/image"
import Link from "next/link"

type CollectionHeroProps = {
  title: string
  season?: string
  itemCount?: number
  imageUrl?: string
  headline?: string
  label?: string
  breadcrumbs?: { label: string; href: string }[]
}

export default function CollectionHero({
  title,
  season,
  itemCount,
  imageUrl,
  headline,
  label,
  breadcrumbs,
}: CollectionHeroProps) {
  const displayLabel = label || "Collection"

  return (
    <section
      data-header-theme="dark"
      className="relative -mt-16 overflow-hidden bg-[var(--color-ink)] h-[480px] lg:h-[620px] flex flex-col"
    >
      {/* Background image — fallback to Ice Industry hero */}
      <Image
        src={imageUrl || "https://api.iceindustry.fr/images/hero/HERO_DESK_ICE2.webp"}
        alt={title}
        fill
        className="object-cover"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 pt-20 lg:pt-24 pb-6 lg:pb-10 px-5 lg:px-16">
        {/* Top row */}
        <div className="flex justify-between items-start">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Fil d'Ariane">
              <ol className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase">
                {breadcrumbs.map((crumb, i) => (
                  <li key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-white">/</span>}
                    {i < breadcrumbs.length - 1 ? (
                      <Link
                        href={crumb.href}
                        className="text-white hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <div />
          )}

          {(itemCount !== undefined || season) && (
            <span className="hidden lg:block font-mono text-[10px] tracking-[0.14em] uppercase text-white">
              {itemCount !== undefined && `${itemCount} pièces`}
              {itemCount !== undefined && season && " · "}
              {season}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom row */}
        <div className="flex items-end justify-between gap-8">
          <div className="max-w-[85%] lg:max-w-[70%]">
            <div className="flex items-center gap-4 mb-3 lg:mb-4">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-white whitespace-nowrap">
                {displayLabel} · {title}
              </span>
              <div className="h-px flex-1 bg-white/30" />
            </div>
            <h1
              className="font-bold text-white tracking-tight"
              style={{
                fontSize: "clamp(36px, 10vw, 56px)",
                lineHeight: 0.95,
              }}
            >
              <span
                className="hidden lg:block"
                style={{ fontSize: "clamp(48px, 5vw, 80px)" }}
              >
                {headline || title}
              </span>
              <span className="lg:hidden">{headline || title}</span>
            </h1>
          </div>

          {/* Scroll indicator (desktop only) */}
          <div className="hidden lg:flex flex-col items-center gap-3.5 shrink-0">
            <span
              className="font-mono text-[10px] tracking-[0.22em] uppercase text-white"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              Découvrir
            </span>
            <div className="w-px h-16 bg-white/35 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-6 bg-white"
                style={{ animation: "scrollHint 2.2s ease-in-out infinite" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
