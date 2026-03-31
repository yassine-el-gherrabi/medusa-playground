import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
}

export default function CGVPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose prose-sm prose-neutral dark:prose-invert">
      <h1 className="text-2xl font-light tracking-wide mb-10">
        Conditions Générales de Vente
      </h1>

      <h2>Article 1 — Objet</h2>
      <p>
        Les présentes conditions générales de vente (CGV) régissent les ventes de
        produits effectuées par Ice Industry via le site internet
        ice-industry.com. Toute commande implique l&apos;acceptation sans réserve
        des présentes CGV.
      </p>

      <h2>Article 2 — Prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises (TTC). Ice
        Industry se réserve le droit de modifier ses prix à tout moment, les
        produits étant facturés sur la base des tarifs en vigueur au moment de la
        validation de la commande.
      </p>

      <h2>Article 3 — Commandes</h2>
      <p>
        L&apos;acheteur peut passer commande sur le site internet. La vente est
        considérée comme conclue dès la confirmation de la commande par
        l&apos;acheteur et après vérification de la disponibilité des produits.
      </p>

      <h2>Article 4 — Paiement</h2>
      <p>
        Le paiement s&apos;effectue en ligne par carte bancaire (Visa,
        Mastercard, American Express), PayPal ou Apple Pay. Le débit est effectué
        au moment de la validation de la commande.
      </p>

      <h2>Article 5 — Livraison</h2>
      <p>
        Les produits sont livrés à l&apos;adresse indiquée par l&apos;acheteur
        lors de la commande. Les délais de livraison sont indicatifs et ne
        constituent pas un engagement contractuel. Tout retard de livraison ne
        peut donner lieu à des dommages et intérêts.
      </p>

      <h2>Article 6 — Droit de rétractation</h2>
      <p>
        Conformément à la législation en vigueur, l&apos;acheteur dispose
        d&apos;un délai de 14 jours à compter de la réception des produits pour
        exercer son droit de rétractation, sans avoir à justifier de motifs ni à
        payer de pénalités. Les frais de retour sont à la charge de
        l&apos;acheteur.
      </p>

      <h2>Article 7 — Garanties</h2>
      <p>
        Tous les produits bénéficient de la garantie légale de conformité et de
        la garantie des vices cachés, conformément aux articles L.217-4 et
        suivants et aux articles 1641 et suivants du Code civil.
      </p>

      <h2>Article 8 — Données personnelles</h2>
      <p>
        Les informations recueillies lors de la commande sont nécessaires au
        traitement de celle-ci. Elles sont traitées conformément à notre
        politique de confidentialité et à la réglementation en vigueur (RGPD).
      </p>

      <h2>Article 9 — Litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige, les
        parties s&apos;efforceront de trouver une solution amiable. À défaut, les
        tribunaux compétents de Paris seront seuls compétents.
      </p>
    </div>
  )
}
