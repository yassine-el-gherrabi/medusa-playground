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
    <section className="border-b border-[var(--color-border)]">
      {/* Desktop: 2-column grid */}
      <div className="hidden lg:grid grid-cols-[280px_1fr] gap-20 py-[120px] px-16 max-w-[1400px] mx-auto items-start">
        {/* Left column */}
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--color-muted)]">
            Manifeste
          </span>
          {(kicker || title) && (
            <h2 className="text-[32px] font-medium tracking-[-0.025em] leading-[1.1] mt-5">
              {kicker || title}
            </h2>
          )}
          {description && (
            <p className="text-[13px] leading-[1.6] mt-3.5 text-[var(--color-muted)]">
              {description}
            </p>
          )}
        </div>

        {/* Right column — double column text */}
        <div>
          <p
            className="text-[18px] leading-[1.7] text-[var(--color-body)] m-0"
            style={{ columnCount: 2, columnGap: 48, textWrap: "pretty" }}
          >
            {body}
          </p>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="lg:hidden py-[60px] px-5">
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--color-muted)]">
          Manifeste
        </span>
        {(kicker || title) && (
          <h2 className="text-[24px] font-medium tracking-[-0.025em] leading-[1.1] mt-3.5">
            {kicker || title}
          </h2>
        )}
        {description && (
          <p className="text-[13px] leading-[1.6] mt-3.5 text-[var(--color-muted)]">
            {description}
          </p>
        )}
        <p className="text-[15px] leading-[1.7] text-[var(--color-body)] mt-8" style={{ textWrap: "pretty" }}>
          {body}
        </p>
      </div>
    </section>
  )
}
