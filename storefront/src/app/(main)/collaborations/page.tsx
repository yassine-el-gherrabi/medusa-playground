import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Collaborations",
}

export default function CollaborationsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light tracking-wide mb-4">
        Collaborations
      </h1>
      <p
        className="text-xs uppercase tracking-[0.3em] mb-10"
        style={{ color: "var(--color-muted)" }}
      >
        Créer ensemble
      </p>

      <section className="mb-12">
        <p
          className="text-sm leading-[1.8] mb-6"
          style={{ color: "var(--color-body)" }}
        >
          La collaboration est au cœur de l&apos;ADN d&apos;Ice Industry. Nous
          croyons que les meilleures créations naissent de la rencontre entre
          des univers différents — artistes, marques, créateurs, athlètes.
        </p>
        <p
          className="text-sm leading-[1.8]"
          style={{ color: "var(--color-body)" }}
        >
          Chaque projet est une occasion de repousser nos limites et de proposer
          des pièces uniques à notre communauté. Du design textile à la
          direction artistique, en passant par les événements et le contenu — les
          possibilités sont ouvertes.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">
          Ce que nous recherchons
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <p className="text-sm font-medium mb-2">Artistes &amp; Créatifs</p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Graphistes, photographes, vidéastes, illustrateurs — des
              créatifs qui apportent une vision unique.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Marques &amp; Labels</p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Des marques qui partagent notre exigence et notre esthétique pour
              des capsules co-brandées.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Athlètes &amp; Ambassadeurs</p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Des personnalités qui incarnent l&apos;esprit Ice Industry au
              quotidien.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Proposer une collaboration
        </h2>
        <p
          className="text-sm leading-[1.8] mb-6"
          style={{ color: "var(--color-body)" }}
        >
          Vous avez un projet en tête ? Présentez-nous votre univers et votre
          idée de collaboration. Nous étudions chaque proposition avec
          attention.
        </p>
        <a
          href="mailto:collab@iceindustry.fr"
          className="inline-flex items-center justify-center h-11 px-8 uppercase tracking-[0.18em] text-[11px] font-medium transition-opacity hover:opacity-80"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-surface)",
          }}
        >
          collab@iceindustry.fr
        </a>
      </section>
    </div>
  )
}
