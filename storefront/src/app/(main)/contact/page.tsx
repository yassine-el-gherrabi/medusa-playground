import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light tracking-wide mb-10">Contact</h1>

      <div className="grid sm:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Téléphone
            </h2>
            <p className="text-sm">+33 1 23 45 67 89</p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Email
            </h2>
            <p className="text-sm">
              <a
                href="mailto:contact@ice-industry.com"
                className="underline hover:text-muted-foreground transition-colors"
              >
                contact@ice-industry.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Adresse
            </h2>
            <p className="text-sm leading-relaxed">
              Ice Industry
              <br />
              12 Rue du Commerce
              <br />
              75015 Paris, France
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Horaires d&apos;ouverture
            </h2>
            <div className="text-sm space-y-1">
              <p>Lundi &ndash; Vendredi : 10h00 &ndash; 19h00</p>
              <p>Samedi : 11h00 &ndash; 18h00</p>
              <p>Dimanche : Fermé</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Service client
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Notre équipe est disponible du lundi au vendredi pour répondre à
              toutes vos questions concernant vos commandes, les retours ou tout
              autre renseignement.
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Délai de réponse
            </h2>
            <p className="text-sm text-muted-foreground">
              Nous nous engageons à répondre à toutes les demandes sous 24 à 48
              heures ouvrées.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
