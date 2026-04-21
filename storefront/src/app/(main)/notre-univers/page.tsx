import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notre Univers",
}

export default function NotreUniversPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p
        className="text-[10px] uppercase tracking-[0.35em] mb-3"
        style={{ color: "var(--color-muted)" }}
      >
        Ice Industry
      </p>
      <h1 className="text-2xl font-light tracking-wide mb-10">
        Nés du Froid
      </h1>

      {/* ── Origine ── */}
      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Marseille
        </h2>
        <p
          className="text-sm leading-[1.8]"
          style={{ color: "var(--color-body)" }}
        >
          Ice Industry est née à Marseille, entre béton brut et lumière
          méditerranéenne. La marque puise son énergie dans les contrastes de
          cette ville : la chaleur du sud et la rigueur du froid, le bitume et
          l&apos;horizon, la rue et l&apos;atelier. Chaque pièce porte
          l&apos;empreinte de cette dualité.
        </p>
      </section>

      {/* ── Philosophie ── */}
      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Streetwear Technique
        </h2>
        <p
          className="text-sm leading-[1.8] mb-4"
          style={{ color: "var(--color-body)" }}
        >
          Nous concevons des vêtements qui allient performance et esthétique
          urbaine. Tissus techniques, coupes structurées, finitions soignées —
          chaque détail est pensé pour résister à l&apos;épreuve du quotidien
          sans jamais sacrifier le style.
        </p>
        <p
          className="text-sm leading-[1.8]"
          style={{ color: "var(--color-body)" }}
        >
          Nos collections sont développées en capsules limitées. Ce format nous
          permet de garantir une qualité irréprochable et une exclusivité réelle
          — loin de la surproduction, au plus près de notre communauté.
        </p>
      </section>

      {/* ── Valeurs ── */}
      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">
          Nos valeurs
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <p className="text-sm font-medium mb-2">Authenticité</p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Pas de compromis sur l&apos;identité. Chaque pièce reflète notre
              vision sans concession.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Qualité</p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Matières premières sélectionnées, fabrication contrôlée, chaque
              article est vérifié avant expédition.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Communauté</p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Ice Industry existe grâce à ceux qui la portent. Notre communauté
              est notre moteur.
            </p>
          </div>
        </div>
      </section>

      {/* ── Engagement ── */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Engagement
        </h2>
        <p
          className="text-sm leading-[1.8]"
          style={{ color: "var(--color-body)" }}
        >
          Nous croyons qu&apos;un vêtement bien conçu dure plus longtemps et se
          porte mieux. C&apos;est pourquoi nous privilégions des matériaux
          durables et des constructions robustes. Produire moins, produire mieux
          — c&apos;est notre manière de respecter à la fois notre art et notre
          environnement.
        </p>
      </section>
    </div>
  )
}
