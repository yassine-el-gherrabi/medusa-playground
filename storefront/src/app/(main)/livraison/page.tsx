import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Livraison & Retours",
}

export default function LivraisonPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose prose-sm prose-neutral dark:prose-invert">
      <h1 className="text-2xl font-light tracking-wide mb-10">
        Livraison &amp; Retours
      </h1>

      {/* ── LIVRAISON ── */}
      <h2>Livraison</h2>

      <h3>Délais de livraison</h3>
      <p>
        Toutes les commandes sont préparées sous 1 à 2 jours ouvrés depuis nos
        entrepôts à Marseille.
      </p>
      <table>
        <thead>
          <tr>
            <th>Mode</th>
            <th>Délai estimé</th>
            <th>Tarif</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Standard (Colissimo)</td>
            <td>3 à 5 jours ouvrés</td>
            <td>4,90 €</td>
          </tr>
          <tr>
            <td>Express (Chronopost)</td>
            <td>24 à 48 heures</td>
            <td>9,90 €</td>
          </tr>
          <tr>
            <td>Point relais</td>
            <td>3 à 5 jours ouvrés</td>
            <td>3,90 €</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Livraison offerte</strong> pour toute commande supérieure à
        150 €.
      </p>

      <h3>Zones de livraison</h3>
      <ul>
        <li>
          <strong>France métropolitaine</strong> — délais et tarifs ci-dessus
        </li>
        <li>
          <strong>DOM-TOM</strong> — 7 à 12 jours ouvrés, frais variables selon
          la destination
        </li>
        <li>
          <strong>Union Européenne</strong> — 5 à 8 jours ouvrés, frais
          variables selon le pays
        </li>
      </ul>

      <h3>Suivi de commande</h3>
      <p>
        Un email de confirmation avec un numéro de suivi vous est envoyé dès
        l&apos;expédition de votre commande. Vous pouvez également suivre votre
        commande depuis votre{" "}
        <a href="/account">espace client</a> ou notre page{" "}
        <a href="/suivi-commande">suivi de commande</a>.
      </p>

      {/* ── RETOURS ── */}
      <h2>Retours</h2>

      <h3>Droit de rétractation</h3>
      <p>
        Conformément au Code de la consommation, vous disposez d&apos;un délai
        de <strong>14 jours</strong> à compter de la réception de votre commande
        pour exercer votre droit de rétractation sans avoir à justifier de
        motifs.
      </p>

      <h3>Conditions de retour</h3>
      <ul>
        <li>Les articles doivent être retournés dans leur état d&apos;origine</li>
        <li>Non portés, non lavés, avec toutes les étiquettes attachées</li>
        <li>Dans leur emballage d&apos;origine si possible</li>
        <li>
          Les articles soldés, personnalisés ou en édition limitée ne sont ni
          repris ni échangés, sauf défaut de fabrication
        </li>
      </ul>

      <h3>Procédure de retour</h3>
      <ol>
        <li>
          Contactez notre service client à{" "}
          <a href="mailto:contact@iceindustry.fr">contact@iceindustry.fr</a>{" "}
          en indiquant votre numéro de commande et le(s) article(s) concerné(s)
        </li>
        <li>
          Vous recevrez un email de confirmation avec les instructions de retour
        </li>
        <li>
          Expédiez le colis à l&apos;adresse indiquée (les frais de retour sont
          à votre charge sauf en cas de défaut ou d&apos;erreur de notre part)
        </li>
        <li>
          Le remboursement est effectué sous 14 jours suivant la réception et la
          vérification de l&apos;article retourné, via le même moyen de paiement
          que celui utilisé lors de l&apos;achat
        </li>
      </ol>

      <h3>Échanges</h3>
      <p>
        Vous souhaitez une autre taille ou un autre coloris ? Contactez-nous à{" "}
        <a href="mailto:contact@iceindustry.fr">contact@iceindustry.fr</a>{" "}
        et nous ferons notre possible pour vous satisfaire, sous réserve de
        disponibilité.
      </p>

      <h3>Articles défectueux</h3>
      <p>
        Si vous constatez un défaut de fabrication, contactez-nous dans les plus
        brefs délais avec une photo de l&apos;article. L&apos;échange ou le
        remboursement sera pris en charge intégralement, frais de retour inclus.
      </p>

      <p className="text-xs text-neutral-500 mt-12">
        Pour toute question, contactez-nous à{" "}
        <a href="mailto:contact@iceindustry.fr">contact@iceindustry.fr</a> ou
        au +33 7 64 08 57 97 du lundi au samedi, de 11h à 19h.
      </p>
    </div>
  )
}
