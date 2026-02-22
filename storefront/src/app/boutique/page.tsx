"use client"

import { useState } from "react"
import Accordion, { type AccordionItemData } from "@/components/ui/Accordion"

const SERVICES = [
  {
    title: "Conseil personnalise",
    description: "Notre equipe vous accompagne dans le choix de vos pieces et vous conseille sur les tailles et les coupes.",
  },
  {
    title: "Click & Collect",
    description: "Commandez en ligne et retirez votre commande en boutique sous 24h. Gratuit, sans frais de livraison.",
  },
  {
    title: "Retours en boutique",
    description: "Retournez vos commandes en ligne directement en boutique pour un echange ou un remboursement immediat.",
  },
]

const FAQ_ITEMS: AccordionItemData[] = [
  {
    title: "Quels sont les horaires d'ouverture ?",
    content: "Du mardi au samedi, de 10h30 a 19h00. Ferme le dimanche et le lundi.",
  },
  {
    title: "Y a-t-il un parking a proximite ?",
    content: "Oui, plusieurs parkings publics sont accessibles a moins de 5 minutes a pied de la boutique.",
  },
  {
    title: "Puis-je essayer avant d'acheter ?",
    content: "Bien sur ! Notre boutique dispose de cabines d'essayage. N'hesitez pas a demander conseil a notre equipe.",
  },
  {
    title: "Acceptez-vous les retours en boutique ?",
    content: "Oui, vous pouvez retourner vos achats en ligne et en boutique sous 14 jours, dans leur etat d'origine.",
  },
]

export default function BoutiquePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-24 md:py-32 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted to-muted/80" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">
            Marseille
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Notre Boutique</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Decouvrez l&apos;univers Ice Industry dans notre boutique au coeur de Marseille.
          </p>
        </div>
      </section>

      {/* Acheter avec nous */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Acheter avec nous</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Plus qu&apos;une boutique, un lieu de rencontre pour la communaute streetwear marseillaise.
          Retrouvez toutes nos collections, nos exclusivites boutique et profitez de
          conseils personnalises de notre equipe.
        </p>
      </section>

      {/* Services */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div key={service.title} className="border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Visit */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Nous rendre visite</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Adresse</h3>
                <p className="text-sm text-muted-foreground">
                  Ice Industry Boutique
                  <br />
                  13001 Marseille, France
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Horaires</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Mardi - Samedi : 10h30 - 19h00</p>
                  <p>Dimanche - Lundi : Ferme</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Contact</h3>
                <p className="text-sm text-muted-foreground">contact@iceindustry.fr</p>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg aspect-square md:aspect-auto flex items-center justify-center text-muted-foreground text-sm">
            Carte Google Maps
          </div>
        </div>
      </section>

      {/* FAQ Boutique */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-6">Questions frequentes</h2>
        <Accordion items={FAQ_ITEMS} />
      </section>
    </div>
  )
}
