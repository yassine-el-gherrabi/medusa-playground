type ManifestoProps = {
  categoryLabel?: string
  title: string
  description?: string
  kicker?: string
  body: string
}

export default function Manifesto({
  categoryLabel,
  title,
  description,
  kicker,
  body,
}: ManifestoProps) {
  return (
    <section>
      {/* Desktop: 2-column grid / Mobile: stacked */}
      <div className="hidden lg:grid grid-cols-[280px_1fr] gap-20 py-[120px] px-16">
        {/* Left column */}
        <div>
          {categoryLabel && (
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
              {categoryLabel}
            </span>
          )}
          <h2 className="text-[22px] font-medium mt-5 text-[var(--color-body)]">
            {title}
          </h2>
          {description && (
            <p className="text-[13px] leading-[1.6] mt-3.5 text-[var(--color-muted)]">
              {description}
            </p>
          )}
        </div>

        {/* Right column */}
        <div>
          {kicker && (
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-70 text-[var(--color-muted)]">
              {kicker}
            </span>
          )}
          <p className="text-[16px] leading-[1.7] mt-4 text-[var(--color-body)]">
            {body}
          </p>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="lg:hidden py-[60px] px-5">
        {categoryLabel && (
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
            {categoryLabel}
          </span>
        )}
        <h2 className="text-[22px] font-medium mt-5 text-[var(--color-body)]">
          {title}
        </h2>
        {description && (
          <p className="text-[13px] leading-[1.6] mt-3.5 text-[var(--color-muted)]">
            {description}
          </p>
        )}
        {kicker && (
          <span className="block font-mono text-[11px] tracking-[0.18em] uppercase opacity-70 text-[var(--color-muted)] mt-10">
            {kicker}
          </span>
        )}
        <p className="text-[16px] leading-[1.7] mt-4 text-[var(--color-body)]">
          {body}
        </p>
      </div>
    </section>
  )
}
