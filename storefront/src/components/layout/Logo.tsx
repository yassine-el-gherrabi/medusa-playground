import Image from "next/image"

/**
 * Logo component — renders both black and white versions.
 * CSS controls which one is visible based on header theme.
 * See globals.css for the :has() rules.
 */
export default function Logo({ className = "h-10 w-auto", variant }: { className?: string; variant?: "black" | "white" }) {
  // When variant is explicitly set, render only that version (used outside header)
  if (variant === "white") {
    return <Image src="/images/logo-white.svg" alt="Ice Industry" width={400} height={240} className={className} priority />
  }
  if (variant === "black") {
    return <Image src="/images/logo-black.svg" alt="Ice Industry" width={400} height={240} className={className} priority />
  }

  // No variant = header usage → render both, CSS controls visibility
  return (
    <>
      <Image src="/images/logo-black.svg" alt="Ice Industry" width={400} height={240} className={`${className} logo-black`} priority />
      <Image src="/images/logo-white.svg" alt="" width={400} height={240} className={`${className} logo-white`} aria-hidden="true" priority={false} />
    </>
  )
}
