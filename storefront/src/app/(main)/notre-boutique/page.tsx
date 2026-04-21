import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notre Boutique",
}

const HORAIRES = [
  { jour: "Lundi", heures: "Fermé" },
  { jour: "Mardi", heures: "11h — 19h" },
  { jour: "Mercredi", heures: "11h — 19h" },
  { jour: "Jeudi", heures: "11h — 19h" },
  { jour: "Vendredi", heures: "11h — 19h" },
  { jour: "Samedi", heures: "11h — 19h" },
  { jour: "Dimanche", heures: "Fermé" },
]

export default function NotreBoutiquePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light tracking-wide mb-4">
        Notre Boutique
      </h1>
      <p
        className="text-xs uppercase tracking-[0.3em] mb-10"
        style={{ color: "var(--color-muted)" }}
      >
        Marseille
      </p>

      <div className="grid sm:grid-cols-2 gap-10 mb-12">
        {/* ── Infos ── */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
              Adresse
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-body)" }}>
              Ice Industry
              <br />
              2 Rue Grignan
              <br />
              13001 Marseille, France
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=2+Rue+Grignan+13001+Marseille"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs uppercase tracking-[0.15em] underline underline-offset-2"
              style={{ color: "var(--color-muted)" }}
            >
              Voir sur Google Maps
            </a>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
              Contact
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-body)" }}>
              <a
                href="https://api.whatsapp.com/send?phone=33768949461"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-60 transition-opacity"
              >
                +33 7 68 94 94 61 (WhatsApp)
              </a>
              <br />
              <a
                href="mailto:contact@iceindustry.fr"
                className="hover:opacity-60 transition-opacity"
              >
                contact@iceindustry.fr
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
              Horaires d&apos;ouverture
            </h2>
            <ul className="space-y-1.5">
              {HORAIRES.map((h) => (
                <li
                  key={h.jour}
                  className="flex justify-between text-sm"
                  style={{ color: "var(--color-body)" }}
                >
                  <span>{h.jour}</span>
                  <span
                    style={{
                      color:
                        h.heures === "Fermé"
                          ? "var(--color-disabled)"
                          : "var(--color-body)",
                    }}
                  >
                    {h.heures}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Description ── */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
              L&apos;espace
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Située au cœur de Marseille, à deux pas du Vieux-Port, notre
              boutique du 2 Rue Grignan est un espace pensé pour refléter
              l&apos;univers Ice Industry. Matériaux bruts, lumière tamisée et
              sélection complète de nos collections — un lieu où le streetwear
              technique se vit en personne.
            </p>
          </div>
          <div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Retrouvez l&apos;ensemble de nos capsules, les exclusivités
              boutique et les conseils personnalisés de notre équipe. Chaque
              visite est une expérience à part entière.
            </p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
              Services en boutique
            </h2>
            <ul
              className="text-sm leading-relaxed space-y-1"
              style={{ color: "var(--color-muted)" }}
            >
              <li>Conseils personnalisés et essayage</li>
              <li>Exclusivités et avant-premières</li>
              <li>Remise en main propre disponible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
