import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mentions Légales",
}

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose prose-sm prose-neutral dark:prose-invert">
      <h1 className="text-2xl font-light tracking-wide mb-10">
        Mentions Légales
      </h1>

      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>iceindustry.fr</strong> est édité par :
      </p>
      <ul>
        <li>
          <strong>Dénomination sociale :</strong> ICE IND
        </li>
        <li>
          <strong>Nom commercial :</strong> Ice Industry
        </li>
        <li>
          <strong>Forme juridique :</strong> SARL (Société à Responsabilité
          Limitée)
        </li>
        <li>
          <strong>Capital social :</strong> 1 000,00 €
        </li>
        <li>
          <strong>Siège social :</strong> 3 Impasse Odde, 13240
          Septèmes-les-Vallons, France
        </li>
        <li>
          <strong>Téléphone :</strong>{" "}
          <a href="tel:+33768949461">+33 7 68 94 94 61</a>
        </li>
        <li>
          <strong>Email :</strong>{" "}
          <a href="mailto:contact@iceindustry.fr">contact@iceindustry.fr</a>
        </li>
        <li>
          <strong>SIREN :</strong> 913 269 007
        </li>
        <li>
          <strong>SIRET (siège) :</strong> 913 269 007 00013
        </li>
        <li>
          <strong>SIRET (boutique Marseille) :</strong> 913 269 007 00021
        </li>
        <li>
          <strong>RCS :</strong> 913 269 007 R.C.S. Aix-en-Provence
        </li>
        <li>
          <strong>Numéro de TVA intracommunautaire :</strong> FR32913269007
        </li>
        <li>
          <strong>Code NAF :</strong> 47.91B — Vente à distance sur catalogue
          spécialisé
        </li>
      </ul>

      <h2>2. Directeur de la publication</h2>
      <p>
        Le directeur de la publication est{" "}
        <strong>Meliane Groffier</strong>, en qualité de Gérante de la société
        ICE IND.
      </p>

      <h2>3. Hébergeur</h2>
      <p>Le site est hébergé par :</p>
      <ul>
        <li>
          <strong>Dénomination :</strong> Vercel Inc.
        </li>
        <li>
          <strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis
        </li>
        <li>
          <strong>Téléphone :</strong> +1 559 288 7060
        </li>
        <li>
          <strong>Site web :</strong>{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            vercel.com
          </a>
        </li>
      </ul>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu du site iceindustry.fr — textes,
        photographies, images, logos, vidéos, sons, mise en page — est protégé
        par le droit d&apos;auteur, le droit des marques et le droit des bases
        de données. Toute reproduction, représentation, modification ou
        dénaturation, totale ou partielle, par quelque procédé que ce soit, est
        interdite sans autorisation écrite préalable d&apos;ICE IND.
      </p>
      <p>
        La marque <strong>Ice Industry</strong> (marque française
        n°FR4976892, enregistrée le 12/07/2023, classes 25) ainsi que
        l&apos;ensemble des marques, illustrations, images et logotypes figurant
        sur le site sont et restent la propriété exclusive d&apos;ICE IND. Toute
        reproduction constitue une contrefaçon au sens des articles L.713-2 et
        suivants du Code de la propriété intellectuelle.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        ICE IND s&apos;engage à protéger vos données personnelles conformément
        au Règlement Général sur la Protection des Données (RGPD) et à la loi
        Informatique et Libertés du 6 janvier 1978 modifiée. Pour en savoir
        plus, consultez notre{" "}
        <a href="/legal/confidentialite">Politique de Confidentialité</a>.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Le site utilise des cookies pour améliorer votre expérience, réaliser
        des statistiques et vous proposer des contenus adaptés. Pour en savoir
        plus et paramétrer vos préférences, consultez notre{" "}
        <a href="/legal/cookies">Politique de Cookies</a>.
      </p>

      <h2>7. Médiation des litiges</h2>
      <p>
        Conformément aux articles L.616-1 et R.616-1 du Code de la
        consommation, ICE IND propose un dispositif de médiation de la
        consommation. En cas de litige non résolu, vous pouvez contacter le
        médiateur de la consommation compétent. Les coordonnées du médiateur
        sont disponibles sur demande auprès de notre service client à{" "}
        <a href="mailto:contact@iceindustry.fr">contact@iceindustry.fr</a>.
      </p>
      <p>
        Vous pouvez également recourir à la plateforme de règlement en ligne des
        litiges de la Commission européenne :{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr
        </a>
      </p>

      <h2>8. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas
        de litige et après tentative de résolution amiable, les tribunaux
        français seront seuls compétents. Le tribunal compétent est celui du
        ressort du siège social d&apos;ICE IND, soit le Tribunal de Commerce
        d&apos;Aix-en-Provence, sauf disposition légale contraire.
      </p>

      <h2>9. Crédits</h2>
      <p>
        <strong>Conception et développement :</strong> Ice Industry
        <br />
        <strong>Photographies :</strong> Ice Industry
      </p>

      <p className="text-xs text-neutral-500 mt-12">
        Dernière mise à jour : avril 2026
      </p>
    </div>
  )
}
