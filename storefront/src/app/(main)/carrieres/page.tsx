import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Carrières",
}

export default function CarrieresPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light tracking-wide mb-4">
        Carrières
      </h1>
      <p
        className="text-xs uppercase tracking-[0.3em] mb-10"
        style={{ color: "var(--color-muted)" }}
      >
        Rejoindre Ice Industry
      </p>

      <section className="mb-12">
        <p
          className="text-sm leading-[1.8] mb-6"
          style={{ color: "var(--color-body)" }}
        >
          Ice Industry est une équipe passionnée qui construit une marque de
          streetwear technique depuis Marseille. Nous cherchons des personnes
          qui partagent notre exigence, notre créativité et notre envie de faire
          les choses différemment.
        </p>
        <p
          className="text-sm leading-[1.8]"
          style={{ color: "var(--color-body)" }}
        >
          Que vous soyez dans le design, la production, le digital, la vente ou
          la logistique — si notre univers vous parle, nous serions ravis
          d&apos;échanger avec vous.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Ce que nous valorisons
        </h2>
        <ul
          className="text-sm leading-[1.8] space-y-2"
          style={{ color: "var(--color-muted)" }}
        >
          <li>L&apos;autonomie et l&apos;esprit d&apos;initiative</li>
          <li>Le souci du détail et de la qualité</li>
          <li>La culture streetwear et la curiosité créative</li>
          <li>L&apos;envie de construire quelque chose de durable</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Candidature spontanée
        </h2>
        <p
          className="text-sm leading-[1.8] mb-6"
          style={{ color: "var(--color-body)" }}
        >
          Nous n&apos;avons pas toujours de postes ouverts, mais nous sommes
          toujours ouverts aux belles rencontres. Envoyez votre CV et un mot sur
          ce qui vous motive à :
        </p>
        <a
          href="mailto:careers@iceindustry.fr"
          className="inline-flex items-center justify-center h-11 px-8 uppercase tracking-[0.18em] text-[11px] font-medium transition-opacity hover:opacity-80"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-surface)",
          }}
        >
          careers@iceindustry.fr
        </a>
      </section>
    </div>
  )
}
