import Image from "next/image"

export default function EditorialBlock({
  imageUrl,
  title,
  text,
  reverse = false,
}: {
  imageUrl: string
  title?: string
  text?: string
  reverse?: boolean
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${reverse ? "md:direction-rtl" : ""}`}>
      <div className={`relative aspect-square md:aspect-auto md:min-h-[500px] ${reverse ? "md:order-2" : ""}`}>
        <Image
          src={imageUrl}
          alt={title || "Editorial"}
          fill
          className="object-cover"
        />
      </div>
      <div className={`flex items-center px-8 md:px-16 py-16 ${reverse ? "md:order-1" : ""}`}>
        <div>
          {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
          {text && <p className="text-muted-foreground leading-relaxed">{text}</p>}
        </div>
      </div>
    </div>
  )
}
