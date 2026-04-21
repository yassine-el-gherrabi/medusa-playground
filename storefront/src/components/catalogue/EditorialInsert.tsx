type EditorialInsertProps = {
  kicker: string
  headline: string
}

export default function EditorialInsert({ kicker, headline }: EditorialInsertProps) {
  return (
    <div
      className="col-span-full relative overflow-hidden"
      style={{ aspectRatio: "4/5" }}
    >
      {/* Desktop aspect ratio override */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ aspectRatio: "21/9" }}
      />

      {/* Background gradient */}
      <div
        className="absolute inset-0 lg:relative lg:h-0 lg:pb-[calc(9/21*100%)]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, #1a1a1a 0%, #0A0A0A 100%)",
        }}
      />

      {/* Content — bottom-left */}
      <div className="absolute inset-0 flex items-end">
        <div className="px-5 lg:px-[72px] pb-6 lg:pb-14">
          <span className="block font-mono text-[11px] tracking-[0.22em] uppercase text-[rgba(250,250,248,0.55)] mb-3">
            {kicker}
          </span>
          <p
            className="font-medium text-[var(--color-surface)]"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            {headline}
          </p>
        </div>
      </div>
    </div>
  )
}
