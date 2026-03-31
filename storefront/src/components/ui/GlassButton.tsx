import Link from "next/link"
import { cn } from "@/lib/utils"

interface GlassButtonProps {
  href: string
  children: React.ReactNode
  className?: string
}

export default function GlassButton({ href, children, className }: GlassButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-block h-10 overflow-hidden",
        "text-[12px] uppercase tracking-wide text-center text-white",
        "bg-black/30 backdrop-blur-[24px]",
        "border border-white/30 rounded-[2px]",
        "hover:bg-white/20 hover:border-white/50",
        className
      )}
    >
      <div className="relative h-10">
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 block w-full h-10 leading-10 px-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
        >
          {children}
        </span>
        <span className="relative block h-10 leading-10 px-6 translate-y-0 group-hover:-translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
          {children}
        </span>
      </div>
    </Link>
  )
}
