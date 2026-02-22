import Accordion, { type AccordionItemData } from "@/components/ui/Accordion"

const SECTIONS: { title: string; items: AccordionItemData[] }[] = [
  {
    title: "Commandes",
    items: [
      {
        title: "Comment passer une commande ?",
        content:
          "Parcourez notre catalogue, selectionnez vos articles et ajoutez-les au panier. Renseignez vos informations de livraison et procedez au paiement securise par carte bancaire.",
      },
      {
        title: "Quels sont les delais de livraison ?",
        content:
          "La livraison standard est effectuee sous 3 a 5 jours ouvrables. La livraison express sous 1 a 2 jours ouvrables. Le retrait en boutique est disponible sous 24h.",
      },
      {
        title: "Combien coute la livraison ?",
        content:
          "Livraison standard : 5,90 EUR. Livraison express : 9,90 EUR. Retrait en boutique (Click & Collect) : Gratuit.",
      },
      {
        title: "Puis-je suivre ma commande ?",
        content:
          "Oui, un email de confirmation avec un numero de suivi vous est envoye des l'expedition de votre commande. Vous pouvez egalement suivre vos commandes depuis votre espace client.",
      },
    ],
  },
  {
    title: "Service client",
    items: [
      {
        title: "Comment retourner un article ?",
        content:
          "Vous disposez de 14 jours apres reception pour retourner un article dans son etat d'origine. Rendez-vous dans votre espace client ou contactez-nous par email pour initier un retour.",
      },
      {
        title: "Comment choisir ma taille ?",
        content:
          "Consultez notre guide des tailles disponible sur chaque page produit. En cas de doute, n'hesitez pas a nous contacter ou a passer en boutique pour essayer.",
      },
      {
        title: "Quels modes de paiement acceptez-vous ?",
        content:
          "Nous acceptons les cartes Visa, Mastercard et American Express. Tous les paiements sont securises via Stripe.",
      },
      {
        title: "Comment vous contacter ?",
        content:
          "Par email a contact@iceindustry.fr ou directement en boutique du mardi au samedi, de 10h30 a 19h00.",
      },
    ],
  },
  {
    title: "Boutique",
    items: [
      {
        title: "Ou se trouve votre boutique ?",
        content: "Notre boutique est situee a Marseille (13001). Retrouvez toutes les informations sur notre page Boutique.",
      },
      {
        title: "Proposez-vous le Click & Collect ?",
        content:
          "Oui ! Commandez en ligne et retirez votre commande en boutique sous 24h. Le retrait est gratuit.",
      },
      {
        title: "Y a-t-il des exclusivites boutique ?",
        content:
          "Oui, certaines pieces et coloris sont disponibles uniquement en boutique. Suivez-nous sur Instagram pour etre informe des drops exclusifs.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="animate-fade-in">
      <section className="py-16 md:py-24 text-center px-4">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">
          Aide
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">Questions frequentes</h1>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-12">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <Accordion items={section.items} />
          </div>
        ))}
      </div>
    </div>
  )
}
