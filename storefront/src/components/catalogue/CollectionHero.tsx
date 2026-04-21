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
      {/* Background image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #1a1a1a 0%, #0A0A0A 100%)",
          }}
        />
      )}

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
                    {i > 0 && <span className="text-white/40">/</span>}
                    {i < breadcrumbs.length - 1 ? (
                      <Link
                        href={crumb.href}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white/60">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <div />
          )}

          {(itemCount !== undefined || season) && (
            <span className="hidden lg:block font-mono text-[10px] tracking-[0.14em] uppercase text-white/60">
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
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/50 whitespace-nowrap">
                {displayLabel} · {title}
              </span>
              <div className="h-px flex-1 bg-white/30" />
            </div>
            <h1
              className="font-bold text-white uppercase tracking-tight"
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
          <div className="hidden lg:flex flex-col items-center gap-3 shrink-0">
            <span
              className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/50"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              Découvrir
            </span>
            <div
              className="w-[2px] h-10"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0))",
                backgroundSize: "2px 40px",
                animation: "scrollLine 2s linear infinite",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
