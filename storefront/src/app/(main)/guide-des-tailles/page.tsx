import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guide des Tailles",
}

const HAUTS = [
  { taille: "XS", tour_poitrine: "86-90", tour_taille: "70-74", longueur: "66", fr: "44", eu: "44", us: "S", uk: "34" },
  { taille: "S", tour_poitrine: "90-94", tour_taille: "74-78", longueur: "68", fr: "46", eu: "46", us: "S/M", uk: "36" },
  { taille: "M", tour_poitrine: "94-98", tour_taille: "78-82", longueur: "70", fr: "48", eu: "48", us: "M", uk: "38" },
  { taille: "L", tour_poitrine: "98-102", tour_taille: "82-86", longueur: "72", fr: "50", eu: "50", us: "L", uk: "40" },
  { taille: "XL", tour_poitrine: "102-106", tour_taille: "86-90", longueur: "74", fr: "52", eu: "52", us: "XL", uk: "42" },
  { taille: "XXL", tour_poitrine: "106-110", tour_taille: "90-94", longueur: "76", fr: "54", eu: "54", us: "XXL", uk: "44" },
]

const BAS = [
  { taille: "XS", tour_taille: "70-74", tour_hanches: "88-92", longueur_entrejambe: "78", fr: "36", eu: "44", us: "28" },
  { taille: "S", tour_taille: "74-78", tour_hanches: "92-96", longueur_entrejambe: "79", fr: "38", eu: "46", us: "30" },
  { taille: "M", tour_taille: "78-82", tour_hanches: "96-100", longueur_entrejambe: "80", fr: "40", eu: "48", us: "32" },
  { taille: "L", tour_taille: "82-86", tour_hanches: "100-104", longueur_entrejambe: "81", fr: "42", eu: "50", us: "34" },
  { taille: "XL", tour_taille: "86-90", tour_hanches: "104-108", longueur_entrejambe: "82", fr: "44", eu: "52", us: "36" },
  { taille: "XXL", tour_taille: "90-94", tour_hanches: "108-112", longueur_entrejambe: "83", fr: "46", eu: "54", us: "38" },
]

const CHAUSSURES = [
  { eu: "39", fr: "39", us: "6.5", uk: "5.5", cm: "24.5" },
  { eu: "40", fr: "40", us: "7", uk: "6", cm: "25" },
  { eu: "41", fr: "41", us: "8", uk: "7", cm: "25.5" },
  { eu: "42", fr: "42", us: "8.5", uk: "7.5", cm: "26.5" },
  { eu: "43", fr: "43", us: "9.5", uk: "8.5", cm: "27" },
  { eu: "44", fr: "44", us: "10", uk: "9", cm: "28" },
  { eu: "45", fr: "45", us: "11", uk: "10", cm: "29" },
  { eu: "46", fr: "46", us: "12", uk: "11", cm: "29.5" },
]

const tableClass =
  "w-full text-xs border-collapse border border-[var(--color-border)]"
const thClass =
  "text-left px-3 py-2.5 uppercase tracking-[0.15em] text-[10px] font-medium border border-[var(--color-border)] bg-[var(--color-surface-warm)]"
const tdClass =
  "px-3 py-2 border border-[var(--color-border)] text-[var(--color-body)]"

export default function GuideTaillesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light tracking-wide mb-10">
        Guide des Tailles
      </h1>

      <p
        className="text-sm leading-relaxed mb-10"
        style={{ color: "var(--color-muted)" }}
      >
        Toutes les mesures sont en centimètres. En cas de doute entre deux
        tailles, nous recommandons de prendre la taille supérieure. Nos pièces
        ont un fit légèrement oversized, fidèle à l&apos;esprit streetwear.
      </p>

      {/* ── HAUTS ── */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Hauts — T-shirts, Hoodies, Vestes
        </h2>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Taille</th>
                <th className={thClass}>Poitrine</th>
                <th className={thClass}>Taille</th>
                <th className={thClass}>Longueur</th>
                <th className={thClass}>FR</th>
                <th className={thClass}>EU</th>
                <th className={thClass}>US</th>
                <th className={thClass}>UK</th>
              </tr>
            </thead>
            <tbody>
              {HAUTS.map((r) => (
                <tr key={r.taille}>
                  <td className={`${tdClass} font-medium`}>{r.taille}</td>
                  <td className={tdClass}>{r.tour_poitrine}</td>
                  <td className={tdClass}>{r.tour_taille}</td>
                  <td className={tdClass}>{r.longueur}</td>
                  <td className={tdClass}>{r.fr}</td>
                  <td className={tdClass}>{r.eu}</td>
                  <td className={tdClass}>{r.us}</td>
                  <td className={tdClass}>{r.uk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── BAS ── */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Bas — Pantalons, Joggers, Cargos
        </h2>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Taille</th>
                <th className={thClass}>Tour de taille</th>
                <th className={thClass}>Hanches</th>
                <th className={thClass}>Entrejambe</th>
                <th className={thClass}>FR</th>
                <th className={thClass}>EU</th>
                <th className={thClass}>US</th>
              </tr>
            </thead>
            <tbody>
              {BAS.map((r) => (
                <tr key={r.taille}>
                  <td className={`${tdClass} font-medium`}>{r.taille}</td>
                  <td className={tdClass}>{r.tour_taille}</td>
                  <td className={tdClass}>{r.tour_hanches}</td>
                  <td className={tdClass}>{r.longueur_entrejambe}</td>
                  <td className={tdClass}>{r.fr}</td>
                  <td className={tdClass}>{r.eu}</td>
                  <td className={tdClass}>{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CHAUSSURES ── */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Chaussures
        </h2>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>EU</th>
                <th className={thClass}>FR</th>
                <th className={thClass}>US</th>
                <th className={thClass}>UK</th>
                <th className={thClass}>CM</th>
              </tr>
            </thead>
            <tbody>
              {CHAUSSURES.map((r) => (
                <tr key={r.eu}>
                  <td className={`${tdClass} font-medium`}>{r.eu}</td>
                  <td className={tdClass}>{r.fr}</td>
                  <td className={tdClass}>{r.us}</td>
                  <td className={tdClass}>{r.uk}</td>
                  <td className={tdClass}>{r.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── COMMENT SE MESURER ── */}
      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Comment prendre ses mesures
        </h2>
        <div className="space-y-4 text-sm" style={{ color: "var(--color-body)" }}>
          <div>
            <p className="font-medium mb-1">Tour de poitrine</p>
            <p style={{ color: "var(--color-muted)" }}>
              Mesurez horizontalement à l&apos;endroit le plus large de la
              poitrine, sous les aisselles, en gardant le mètre-ruban bien à
              plat.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Tour de taille</p>
            <p style={{ color: "var(--color-muted)" }}>
              Mesurez à l&apos;endroit le plus étroit du torse, généralement au
              niveau du nombril, sans serrer.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Tour de hanches</p>
            <p style={{ color: "var(--color-muted)" }}>
              Mesurez à l&apos;endroit le plus large des hanches et des fesses.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Longueur d&apos;entrejambe</p>
            <p style={{ color: "var(--color-muted)" }}>
              Mesurez de l&apos;entrejambe jusqu&apos;au bas de la cheville.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Pointure</p>
            <p style={{ color: "var(--color-muted)" }}>
              Posez votre pied sur une feuille de papier, tracez le contour et
              mesurez la distance entre le talon et l&apos;orteil le plus long.
            </p>
          </div>
        </div>
      </section>

      {/* ── NOTES SUR LE FIT ── */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">
          Notes sur le fit
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          Nos pièces sont conçues avec un fit légèrement oversized, fidèle à
          l&apos;ADN streetwear de la marque. Si vous préférez un rendu plus
          ajusté, nous vous conseillons de prendre une taille en dessous de
          votre taille habituelle. Pour toute question, notre service client se
          tient à votre disposition à{" "}
          <a
            href="mailto:contact@iceindustry.fr"
            className="underline underline-offset-2"
          >
            contact@iceindustry.fr
          </a>
          .
        </p>
      </section>
    </div>
  )
}
