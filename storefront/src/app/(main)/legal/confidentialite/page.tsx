import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
}

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose prose-sm prose-neutral dark:prose-invert">
      <h1 className="text-2xl font-light tracking-wide mb-10">
        Politique de Confidentialité
      </h1>

      <h2>Responsable du traitement</h2>
      <p>
        Ice Industry, dont le siège social est situé au 12 Rue du Commerce,
        75015 Paris, France, est responsable du traitement des données
        personnelles collectées sur le site ice-industry.com.
      </p>

      <h2>Données collectées</h2>
      <p>
        Nous collectons les données suivantes dans le cadre de votre utilisation
        du site : nom, prénom, adresse email, adresse postale, numéro de
        téléphone, informations de paiement et historique de commandes. Ces
        données sont nécessaires au traitement de vos commandes et à la gestion
        de votre compte client.
      </p>

      <h2>Finalités du traitement</h2>
      <p>Vos données personnelles sont utilisées pour :</p>
      <ul>
        <li>Le traitement et le suivi de vos commandes</li>
        <li>La gestion de votre compte client</li>
        <li>L&apos;envoi de communications commerciales (avec votre consentement)</li>
        <li>L&apos;amélioration de nos services et de votre expérience utilisateur</li>
        <li>Le respect de nos obligations légales et réglementaires</li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Vos données personnelles sont conservées pendant une durée de 3 ans à
        compter de votre dernière interaction avec Ice Industry, sauf obligation
        légale de conservation plus longue.
      </p>

      <h2>Vos droits</h2>
      <p>
        Conformément au Règlement Général sur la Protection des Données (RGPD),
        vous disposez des droits suivants : accès, rectification, suppression,
        limitation du traitement, portabilité des données et opposition. Pour
        exercer ces droits, contactez-nous à l&apos;adresse
        privacy@ice-industry.com.
      </p>

      <h2>Partage des données</h2>
      <p>
        Vos données peuvent être partagées avec nos prestataires de services
        (livraison, paiement) dans la stricte mesure nécessaire au traitement de
        vos commandes. Nous ne vendons jamais vos données personnelles à des
        tiers.
      </p>

      <h2>Sécurité</h2>
      <p>
        Nous mettons en place des mesures techniques et organisationnelles
        appropriées pour protéger vos données personnelles contre tout accès non
        autorisé, modification, divulgation ou destruction.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative à la protection de vos données personnelles,
        vous pouvez nous contacter à l&apos;adresse privacy@ice-industry.com.
      </p>
    </div>
  )
}
