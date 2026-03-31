import Image from "next/image"

export default function Logo({
  className = "h-10 w-auto",
  variant = "black",
}: {
  className?: string
  variant?: "black" | "white"
}) {
  const src =
    variant === "white" ? "/images/logo-white.svg" : "/images/logo-black.svg"

  return (
    <Image
      src={src}
      alt="Ice Industry"
      width={400}
      height={240}
      className={className}
      priority
    />
  )
}
