import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de Cookies",
}

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose prose-sm prose-neutral dark:prose-invert">
      <h1 className="text-2xl font-light tracking-wide mb-10">
        Politique de Cookies
      </h1>

      <h2>Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre terminal
        (ordinateur, tablette, smartphone) lors de votre visite sur notre site.
        Il permet de stocker des informations relatives à votre navigation et de
        vous reconnaître lors de vos visites ultérieures.
      </p>

      <h2>Cookies utilisés</h2>
      <p>Nous utilisons les catégories de cookies suivantes :</p>

      <h3>Cookies essentiels</h3>
      <p>
        Ces cookies sont indispensables au fonctionnement du site. Ils permettent
        la navigation, la gestion du panier et l&apos;authentification. Ils ne
        peuvent pas être désactivés.
      </p>

      <h3>Cookies analytiques</h3>
      <p>
        Ces cookies nous aident à comprendre comment les visiteurs interagissent
        avec le site en collectant des informations de manière anonyme. Ils nous
        permettent d&apos;améliorer continuellement votre expérience.
      </p>

      <h3>Cookies marketing</h3>
      <p>
        Ces cookies sont utilisés pour vous proposer des publicités pertinentes
        en fonction de vos centres d&apos;intérêt. Ils sont déposés par nos
        partenaires publicitaires avec votre consentement.
      </p>

      <h2>Gestion des cookies</h2>
      <p>
        Vous pouvez gérer vos préférences en matière de cookies à tout moment via
        les paramètres de votre navigateur. La désactivation de certains cookies
        peut affecter votre expérience de navigation sur le site.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les cookies sont conservés pour une durée maximale de 13 mois
        conformément aux recommandations de la CNIL. Au-delà de cette période,
        votre consentement sera à nouveau sollicité.
      </p>

      <h2>Vos droits</h2>
      <p>
        Pour en savoir plus sur vos droits en matière de données personnelles,
        consultez notre Politique de Confidentialité ou contactez-nous à
        l&apos;adresse privacy@ice-industry.com.
      </p>
    </div>
  )
}
