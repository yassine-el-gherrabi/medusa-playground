import Link from "next/link"
import { cn } from "@/lib/utils"

type GlassVariant = "dark" | "light"

interface GlassButtonBaseProps {
  children: React.ReactNode
  variant?: GlassVariant
  className?: string
}

interface GlassLinkProps extends GlassButtonBaseProps {
  href: string
  onClick?: () => void
}

interface GlassActionProps extends GlassButtonBaseProps {
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
}

const variantStyles: Record<GlassVariant, string> = {
  dark: "bg-black/30 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50",
  light: "bg-white/30 backdrop-blur-md border-white/40 text-foreground hover:bg-white/50 hover:border-white/60",
}

function glassClasses(variant: GlassVariant, className?: string) {
  return cn(
    "shiny-btn inline-flex items-center justify-center h-10 px-7 rounded-[2px] border",
    "uppercase tracking-[0.18em] text-[11px] md:text-xs font-medium",
    "transition-all duration-200",
    variantStyles[variant],
    className
  )
}

export function GlassLink({ href, children, variant = "dark", className, onClick }: GlassLinkProps) {
  return (
    <Link href={href} onClick={onClick} className={glassClasses(variant, className)}>
      <span className="shiny-text">{children}</span>
    </Link>
  )
}

export function GlassAction({ children, variant = "dark", className, onClick, disabled, type = "button" }: GlassActionProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={glassClasses(variant, cn(disabled && "opacity-50 cursor-not-allowed", className))}>
      <span className="shiny-text">{children}</span>
    </button>
  )
}

// Default export for backward compatibility
export default function GlassButton({ href, children, className }: GlassLinkProps) {
  return <GlassLink href={href} className={className}>{children}</GlassLink>
}
