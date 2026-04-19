import Image from "next/image"

export default function Logo({
  className = "h-10 w-auto",
}: {
  className?: string
  variant?: "black" | "white" // kept for backward compat but CSS controls visibility now
}) {
  return (
    <>
      <Image
        src="/images/logo-black.svg"
        alt="Ice Industry"
        width={400}
        height={240}
        className={`${className} logo-black`}
        priority
      />
      <Image
        src="/images/logo-white.svg"
        alt="Ice Industry"
        width={400}
        height={240}
        className={`${className} logo-white`}
        priority
      />
    </>
  )
}
