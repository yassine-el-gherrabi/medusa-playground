export default function CookiesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Politique de cookies</h1>
      <p className="text-muted-foreground mb-4">Dernière mise à jour : Février 2026</p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Un cookie est un petit fichier texte déposé sur votre navigateur lors de votre visite sur
        notre site. Il permet de stocker des informations relatives à votre navigation.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Cookies essentiels</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Ces cookies sont nécessaires au fonctionnement du site : gestion du panier, authentification,
        sélection de la région. Ils ne peuvent pas être désactivés.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Cookies analytiques</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Nous utilisons Google Analytics (GA4) pour comprendre comment les visiteurs utilisent notre
        site. Ces données sont anonymisées et nous aident à améliorer votre expérience.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Gestion des cookies</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Vous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres
        de votre navigateur. La désactivation de certains cookies peut affecter votre expérience
        de navigation.
      </p>
    </div>
  )
}
