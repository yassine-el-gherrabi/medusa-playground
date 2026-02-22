import Image from "next/image"

export default function EditorialHero({
  title,
  description,
  imageUrl,
}: {
  title: string
  description?: string
  imageUrl?: string
}) {
  return (
    <section className="relative h-[70vh] md:h-[80vh] flex items-end overflow-hidden">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16 w-full">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-3">Collection</p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
        {description && (
          <p className="text-lg text-white/70 max-w-xl leading-relaxed">{description}</p>
        )}
      </div>
    </section>
  )
}
