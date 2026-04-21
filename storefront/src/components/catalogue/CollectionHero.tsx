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
      className="relative -mt-16 overflow-hidden bg-[var(--color-ink)] h-[480px] lg:h-[620px]"
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

      {/* Gradient overlay — same as homepage hero */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Top-left: Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Fil d'Ariane"
            className="absolute top-20 lg:top-24 left-5 lg:left-10"
          >
            <ol className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <span className="text-[rgba(250,250,248,0.35)]">/</span>
                  )}
                  {i < breadcrumbs.length - 1 ? (
                    <Link
                      href={crumb.href}
                      className="text-[rgba(250,250,248,0.55)] hover:text-[rgba(250,250,248,0.8)] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[rgba(250,250,248,0.55)]">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Top-right: Item count + Season (desktop only) */}
        {(itemCount !== undefined || season) && (
          <div className="absolute top-20 lg:top-24 right-10 hidden lg:block">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[rgba(250,250,248,0.55)]">
              {itemCount !== undefined && `${itemCount} pièces`}
              {itemCount !== undefined && season && " · "}
              {season}
            </span>
          </div>
        )}

        {/* Bottom-left: Label + Headline/Title */}
        <div className="absolute bottom-8 lg:bottom-10 left-5 lg:left-16 max-w-[85%] lg:max-w-[70%]">
          <div className="flex items-center gap-4 mb-3 lg:mb-4">
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[rgba(250,250,248,0.55)] whitespace-nowrap">
              {displayLabel} · {title}
            </span>
            <div className="h-px flex-1 bg-white/30" />
          </div>
          <h1
            className="font-medium text-[var(--color-surface)]"
            style={{
              fontSize: "clamp(36px, 10vw, 56px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
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

        {/* Bottom-right: Scroll indicator (desktop only) */}
        <div className="absolute bottom-14 right-10 hidden lg:flex flex-col items-center gap-3">
          <span
            className="font-mono text-[10px] tracking-[0.18em] uppercase text-[rgba(250,250,248,0.55)]"
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
                "linear-gradient(to bottom, rgba(250,250,248,0.6), rgba(250,250,248,0))",
              backgroundSize: "2px 40px",
              animation: "scrollLine 2s linear infinite",
            }}
          />
        </div>
      </div>
    </section>
  )
}
