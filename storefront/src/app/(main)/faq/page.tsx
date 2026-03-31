import type { Metadata } from "next"
import { AccordionItem } from "@/components/ui/Accordion"

export const metadata: Metadata = {
  title: "FAQ",
}

const FAQ_ITEMS = [
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "Les commandes sont expédiées sous 1 à 2 jours ouvrés. La livraison standard en France métropolitaine prend 3 à 5 jours ouvrés. La livraison express est disponible sous 24 à 48h.",
  },
  {
    question: "Comment effectuer un retour ou un échange ?",
    answer:
      "Vous disposez de 14 jours à compter de la réception de votre commande pour effectuer un retour. Les articles doivent être dans leur état d'origine, non portés et avec les étiquettes. Contactez notre service client pour obtenir une étiquette de retour.",
  },
  {
    question: "Quels modes de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal et Apple Pay. Tous les paiements sont sécurisés et chiffrés.",
  },
  {
    question: "Comment suivre ma commande ?",
    answer:
      "Un email de confirmation avec un numéro de suivi vous est envoyé dès l'expédition de votre commande. Vous pouvez également suivre vos commandes depuis votre espace client dans la rubrique « Commandes ».",
  },
  {
    question: "Les articles sont-ils authentiques ?",
    answer:
      "Tous nos articles sont 100% authentiques et proviennent directement des marques ou de distributeurs agréés. Chaque pièce est vérifiée par notre équipe avant expédition.",
  },
  {
    question: "Livrez-vous à l'international ?",
    answer:
      "Oui, nous livrons dans toute l'Union Européenne. Les frais de livraison et délais varient selon la destination. Consultez la page de paiement pour connaître les frais applicables à votre pays.",
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light tracking-wide mb-10">
        Questions Fréquentes
      </h1>

      <div>
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={i} title={item.question}>
            {item.answer}
          </AccordionItem>
        ))}
      </div>
    </div>
  )
}
