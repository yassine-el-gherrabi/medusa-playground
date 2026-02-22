export default function CookiesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Politique de cookies</h1>
      <p className="text-muted-foreground mb-4">Derniere mise a jour : Fevrier 2026</p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Un cookie est un petit fichier texte depose sur votre navigateur lors de votre visite sur
        notre site. Il permet de stocker des informations relatives a votre navigation.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Cookies essentiels</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Ces cookies sont necessaires au fonctionnement du site : gestion du panier, authentification,
        selection de la region. Ils ne peuvent pas etre desactives.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Cookies analytiques</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Nous utilisons Google Analytics (GA4) pour comprendre comment les visiteurs utilisent notre
        site. Ces donnees sont anonymisees et nous aident a ameliorer votre experience.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Gestion des cookies</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Vous pouvez a tout moment modifier vos preferences en matiere de cookies via les parametres
        de votre navigateur. La desactivation de certains cookies peut affecter votre experience
        de navigation.
      </p>
    </div>
  )
}
