"use client"

import { useState, useEffect, useCallback } from "react"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import type { Product } from "@/types"

// ── Info tab definitions ──

export const INFO_TABS = [
  { key: "details", label: "Détails & Matière", kicker: "01" },
  { key: "care", label: "Entretien", kicker: "02" },
  { key: "shipping", label: "Livraison & Retours", kicker: "03" },
]

// ── Shared content generator ──

export function getInfoContent(product: Product): Record<string, React.ReactNode> {
  return {
    details: (
      <>
        {product.description && <p className="mb-0">{product.description}</p>}
        {product.material && (
          <dl className="mt-6 lg:mt-9 grid gap-y-4 gap-x-6 text-[14px]" style={{ gridTemplateColumns: "120px 1fr" }}>
            {[
              ["Matière", product.material],
              ...(product.weight ? [["Poids", `${product.weight}g`]] : []),
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)] pt-0.5">{k}</dt>
                <dd className="m-0 leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </>
    ),
    care: (
      <>
        <p>Pour préserver la matière et les finitions sur le long terme, nous recommandons un entretien doux.</p>
        <ul className="mt-5 lg:mt-8 p-0 list-none border-t border-[var(--color-border)]">
          {[
            "Lavage 30°C à l'envers",
            "Repassage doux au dos de l'impression",
            "Ne pas sécher en machine",
            "Ne pas nettoyer à sec",
          ].map((t) => (
            <li key={t} className="py-3 lg:py-4 border-b border-[var(--color-border)] flex items-center gap-4 text-[13px] lg:text-[14px]">
              <span className="w-1 h-1 rounded-full bg-[var(--color-ink)] shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </>
    ),
    shipping: (
      <>
        <p>Expédition rapide depuis Marseille, emballage signature Ice Industry.</p>
        <div className="mt-6 lg:mt-9 grid grid-cols-2 gap-px bg-[var(--color-border)] border border-[var(--color-border)]">
          {[
            ["Standard", "Offerte dès 80 €", "3–5 jours ouvrés"],
            ["Express", "9,90 €", "J+1 en France"],
            ["Retrait boutique", "Gratuit", "Marseille · 24h"],
            ["International", "Dès 14,90 €", "Europe · Monde"],
          ].map(([t, p, d]) => (
            <div key={t} className="bg-white p-4 lg:p-5">
              <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)]">{t}</div>
              <div className="mt-2 lg:mt-2.5 text-[15px] lg:text-[17px] font-medium tracking-[-0.01em]">{p}</div>
              <div className="mt-1 text-[12px] text-[var(--color-body)]">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-5 lg:mt-7 text-[13px] text-[var(--color-body)] leading-relaxed">
          Retours gratuits sous 30 jours. Remboursement sous 5 jours ouvrés après réception.
        </p>
      </>
    ),
  }
}

// ── Mobile accordion ──

export function MobileInfoAccordion({ product }: { product: Product }) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const content = getInfoContent(product)

  return (
    <div className="lg:hidden mt-4 border-t border-[var(--color-border)]">
      {INFO_TABS.map((tab) => {
        const isOpen = openKey === tab.key
        return (
          <div key={tab.key} className="border-b border-[var(--color-border)]">
            <button
              onClick={() => setOpenKey(isOpen ? null : tab.key)}
              aria-expanded={isOpen}
              className="w-full py-5 px-0 flex justify-between items-center cursor-pointer bg-transparent border-none text-left"
            >
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase">{tab.label}</span>
              <svg
                width="12" height="12" viewBox="0 0 12 12"
                className="transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
              >
                <path d="M6 1v10M1 6h10" stroke="var(--color-ink)" strokeWidth="1.2" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: isOpen ? 600 : 0 }}
            >
              <div className="pb-5 text-[13px] leading-relaxed text-[var(--color-body)]">
                {content[tab.key]}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Desktop info overlay panel ──

export function InfoOverlay({
  activeKey,
  onOpen,
  onClose,
  product,
}: {
  activeKey: string | null
  onOpen: (key: string) => void
  onClose: () => void
  product: Product
}) {
  const tab = INFO_TABS.find((t) => t.key === activeKey)
  const isOpen = !!tab

  const stableClose = useCallback(() => onClose(), [onClose])
  useEscapeKey(isOpen, stableClose)

  const bodyContent = getInfoContent(product)

  return (
    <div
      aria-hidden={!isOpen}
      className="absolute inset-0 bg-white flex flex-col transition-all duration-300"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transform: isOpen ? "translateY(0)" : "translateY(12px)",
        paddingLeft: 56,
        paddingRight: 8,
      }}
    >
      {tab && (
        <>
          <div className="flex justify-between items-center pt-1 pb-6">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)]">{tab.kicker} /</span>
              <h2 className="text-[32px] font-medium tracking-[-0.025em] m-0">{tab.label}</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-[0.18em] uppercase p-0"
            >
              Fermer
              <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1 1l9 9M10 1l-9 9" stroke="var(--color-ink)" strokeWidth="1.2" /></svg>
            </button>
          </div>

          <div className="h-px bg-[var(--color-border)]" />

          <div className="flex-1 overflow-y-auto pt-8 pb-10 text-[14px] leading-[1.7] text-[var(--color-body)]" style={{ textWrap: "pretty" }}>
            {bodyContent[tab.key]}
          </div>

          <div className="border-t border-[var(--color-border)] flex">
            {INFO_TABS.filter((t) => t.key !== tab.key).map((t, idx) => (
              <button
                key={t.key}
                onClick={() => onOpen(t.key)}
                className="flex-1 bg-transparent border-none py-4.5 px-3.5 flex justify-between items-center cursor-pointer text-left font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                style={{ borderLeft: idx > 0 ? "1px solid var(--color-border)" : "none" }}
              >
                <span>{t.label}</span>
                <span className="text-[14px]">→</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
