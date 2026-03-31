import Link from "next/link"

type AnimatedLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
  onClick?: () => void
}

export default function AnimatedLink({
  href,
  children,
  className = "",
  external = false,
  onClick,
}: AnimatedLinkProps) {
  const content = (
    <span className="relative inline-flex items-center gap-1.5">
      <span className="inline-block transition-transform duration-300 group-hover/alink:-translate-x-0.5">
        &rarr;
      </span>
      {children}
      <span className="absolute left-0 bottom-0 w-full h-px bg-current origin-right transition-transform duration-300 group-hover/alink:scale-x-0" />
      <span className="absolute left-0 bottom-0 w-full h-px bg-current scale-x-0 origin-left transition-transform duration-300 delay-200 group-hover/alink:scale-x-100" />
    </span>
  )

  const linkClassName = `group/alink ${className}`

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        onClick={onClick}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={linkClassName} onClick={onClick}>
      {content}
    </Link>
  )
}
