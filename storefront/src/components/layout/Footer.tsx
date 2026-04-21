"use client"

import { useState } from "react"
import Link from "next/link"
import AnimatedLink from "@/components/ui/AnimatedLink"
import { CookieSettingsButton } from "@/components/cookie/CookieConsent"


const SERVICE_CLIENT_LINKS = [
  { label: "F.A.Q", href: "/faq" },
  { label: "Suivre ma commande", href: "/suivi-commande" },
  { label: "Livraison & retours", href: "/livraison" },
  { label: "Entretien & guide des tailles", href: "/guide-des-tailles" },
]

const ENTREPRISE_LINKS = [
  { label: "Notre univers", href: "/notre-univers" },
  { label: "La marque", href: "/legal/mentions-legales" },
  { label: "Carrières", href: "/carrieres" },
  { label: "Collaborations", href: "/collaborations" },
]

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/ice_industry_" },
  { label: "TikTok", href: "https://www.tiktok.com/@ice_industry" },
  { label: "Snapchat", href: "https://www.snapchat.com/@ice_industry" },
  { label: "Snapchat Ice for Girls", href: "https://www.snapchat.com/@ice_forgirl" },
]

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/legal/mentions-legales" },
  { label: "Conditions générales de vente", href: "/legal/cgv" },
  { label: "Politique de confidentialité", href: "/legal/confidentialite" },
  { label: "Politique de cookies", href: "/legal/cookies" },
]

/* ── Accordion Column (mobile only, desktop always open) ── */

function FooterAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-black/10 last:border-b-0 lg:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 lg:py-0 lg:mb-5 lg:cursor-default"
      >
        <span className="text-xs uppercase tracking-[0.2em] font-medium">
          {title}
        </span>
        <span className="lg:hidden text-xs text-black/40 leading-none select-none">
          {open ? "\u2014" : "+"}
        </span>
      </button>
      {/* Mobile: animated accordion */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
      {/* Desktop: always visible */}
      <div className="hidden lg:block">
        {children}
      </div>
    </div>
  )
}


export default function Footer() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleAccordionToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  const linkClasses =
    "text-xs text-black/50 hover:text-black transition-colors duration-200 uppercase tracking-wider"

  return (
    <footer className="mt-auto">
      {/* COUCHE 1 — Bandeau Services (fond blanc) */}
      <div className="bg-white border-t border-black/10">
        <div className="px-6 lg:px-12">
          {/* Desktop: 3 cols side by side with vertical dividers */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:divide-x lg:divide-black/10">
            {/* Newsletter */}
            <div className="p-8 lg:p-10">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
                S&apos;inscrire à notre newsletter
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Recevez -10% sur votre première commande et un accès exclusif à nos nouveaux drops.
              </p>
              <AnimatedLink
                href="/newsletter"
                className="text-xs text-black/70 hover:text-black transition-colors duration-200"
              >
                S&apos;inscrire
              </AnimatedLink>
            </div>

            {/* Conseils */}
            <div className="p-8 lg:p-10">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
                Besoin de conseils ?
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Notre équipe se tient à votre disposition pour répondre à vos questions, du lundi au samedi de 11h à 19h.
              </p>
              <AnimatedLink
                href="/contact"
                className="text-xs text-black/70 hover:text-black transition-colors duration-200"
              >
                Contactez-nous
              </AnimatedLink>
            </div>

            {/* Livraison */}
            <div className="p-8 lg:p-10">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
                Livraison &amp; retours
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Les frais de livraison sont offerts pour toute commande au-delà d&apos;un certain montant. Vous disposez de 14 jours après réception pour retourner vos articles.
              </p>
              <AnimatedLink
                href="/livraison"
                className="text-xs text-black/70 hover:text-black transition-colors duration-200"
              >
                En savoir plus
              </AnimatedLink>
            </div>
          </div>

          {/* Mobile: stacked with horizontal dividers */}
          <div className="lg:hidden flex flex-col divide-y divide-black/10">
            {/* Newsletter */}
            <div className="py-8 px-2">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
                S&apos;inscrire à notre newsletter
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Recevez -10% sur votre première commande et un accès exclusif à nos nouveaux drops.
              </p>
              <AnimatedLink
                href="/newsletter"
                className="text-xs text-black/70 hover:text-black transition-colors duration-200"
              >
                S&apos;inscrire
              </AnimatedLink>
            </div>

            {/* Conseils */}
            <div className="py-8 px-2">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
                Besoin de conseils ?
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Notre équipe se tient à votre disposition pour répondre à vos questions, du lundi au samedi de 11h à 19h.
              </p>
              <AnimatedLink
                href="/contact"
                className="text-xs text-black/70 hover:text-black transition-colors duration-200"
              >
                Contactez-nous
              </AnimatedLink>
            </div>

            {/* Livraison */}
            <div className="py-8 px-2">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-3">
                Livraison &amp; retours
              </h3>
              <p className="text-xs text-black/60 leading-relaxed mb-4">
                Les frais de livraison sont offerts pour toute commande au-delà d&apos;un certain montant. Vous disposez de 14 jours après réception pour retourner vos articles.
              </p>
              <AnimatedLink
                href="/livraison"
                className="text-xs text-black/70 hover:text-black transition-colors duration-200"
              >
                En savoir plus
              </AnimatedLink>
            </div>
          </div>
        </div>
      </div>

      {/* COUCHE 2 — Colonnes de liens (5 cols Stone Island style) */}
      <div className="bg-white border-t border-black/10">
        <div className="px-6 lg:px-12 py-8">
          <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            {/* SERVICE CLIENT */}
            <FooterAccordion
              title="Service client"
              open={activeIndex === 0}
              onToggle={() => handleAccordionToggle(0)}
            >
              <ul className="space-y-3">
                {SERVICE_CLIENT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClasses}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>

            {/* ENTREPRISE */}
            <FooterAccordion
              title="Entreprise"
              open={activeIndex === 1}
              onToggle={() => handleAccordionToggle(1)}
            >
              <ul className="space-y-3">
                {ENTREPRISE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClasses}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>

            {/* SUIVEZ-NOUS */}
            <FooterAccordion
              title="Suivez-nous"
              open={activeIndex === 2}
              onToggle={() => handleAccordionToggle(2)}
            >
              <ul className="space-y-3">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClasses}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterAccordion>

            {/* CONTACT */}
            <FooterAccordion
              title="Contact"
              open={activeIndex === 3}
              onToggle={() => handleAccordionToggle(3)}
            >
              <ul className="space-y-3">
                <li>
                  <Link href="/contact" className={linkClasses}>
                    Nous contacter
                  </Link>
                </li>
                <li>
                  <Link href="/notre-boutique" className={linkClasses}>
                    Boutique Marseille
                  </Link>
                </li>
                <li>
                  <a
                    href="tel:+33764085797"
                    className="text-xs text-black/50 hover:text-black transition-colors duration-200"
                  >
                    +33 7 64 08 57 97
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@iceindustry.fr"
                    className="text-xs text-black/50 hover:text-black transition-colors duration-200"
                  >
                    contact@iceindustry.fr
                  </a>
                </li>
              </ul>
            </FooterAccordion>

            {/* LEGAL */}
            <FooterAccordion
              title="Légal"
              open={activeIndex === 4}
              onToggle={() => handleAccordionToggle(4)}
            >
              <ul className="space-y-3">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClasses}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>
          </div>
        </div>
      </div>

      {/* COUCHE 3 — Bottom bar (copyright) */}
      <div className="bg-white border-t border-black/10 py-6 px-6 lg:px-12">
        <p className="text-[10px] text-black uppercase tracking-wider text-center">
          &copy; 2026 Ice Industry. Tous droits réservés.
          <span className="mx-2 text-black/30">·</span>
          <CookieSettingsButton />
        </p>
      </div>
    </footer>
  )
}
