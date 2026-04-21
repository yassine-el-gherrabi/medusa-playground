"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  getConsent,
  saveConsent,
  type CookieCategory,
} from "@/lib/cookies"

/* ── Category definitions ── */

type Category = {
  key: CookieCategory
  label: string
  description: string
}

const CATEGORIES: Category[] = [
  {
    key: "analytics",
    label: "Analytiques",
    description:
      "Nous aident à comprendre comment vous naviguez sur le site pour améliorer votre expérience.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description:
      "Permettent de vous proposer des contenus et publicités adaptés à vos centres d'intérêt.",
  },
  {
    key: "functional",
    label: "Fonctionnels",
    description:
      "Mémorisent vos préférences (langue, région) pour personnaliser votre visite.",
  },
]

/* ── Toggle ── */

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}) {
  return (
    <button
      role="switch"
      type="button"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0"
      style={{
        background: checked ? "var(--color-ink)" : "var(--color-border)",
      }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white transition-transform duration-200"
        style={{
          transform: checked ? "translateX(18px)" : "translateX(0)",
        }}
      />
    </button>
  )
}

/* ── Main Component ── */

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [preferences, setPreferences] = useState<Record<CookieCategory, boolean>>({
    analytics: false,
    marketing: false,
    functional: false,
  })

  useEffect(() => {
    // Only show if no valid consent exists
    const consent = getConsent()
    if (!consent) {
      // Small delay for page to render before showing overlay
      const t = setTimeout(() => {
        setVisible(true)
        setMounted(true)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [])

  const handleAcceptAll = useCallback(() => {
    saveConsent({ analytics: true, marketing: true, functional: true })
    setVisible(false)
  }, [])

  const handleRefuseAll = useCallback(() => {
    saveConsent({ analytics: false, marketing: false, functional: false })
    setVisible(false)
  }, [])

  const handleSavePreferences = useCallback(() => {
    saveConsent(preferences)
    setVisible(false)
  }, [preferences])

  const toggleCategory = useCallback((key: CookieCategory) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* ── Backdrop blur overlay ── */}
      <div
        className="fixed inset-0 z-[9998] transition-all duration-700"
        style={{
          backdropFilter: visible ? "blur(18px)" : "blur(0px)",
          WebkitBackdropFilter: visible ? "blur(18px)" : "blur(0px)",
          background: visible ? "rgba(10, 10, 10, 0.4)" : "rgba(10, 10, 10, 0)",
          pointerEvents: visible ? "auto" : "none",
          opacity: visible ? 1 : 0,
        }}
      />

      {/* ── Cookie panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gestion des cookies"
        className="fixed inset-0 z-[9999] flex items-center justify-center px-5 transition-all duration-700"
        style={{
          pointerEvents: visible ? "auto" : "none",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
        }}
      >
        <div
          className="w-full max-w-[520px] overflow-hidden"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Header */}
          <div className="px-7 pt-8 pb-2">
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-3"
              style={{ color: "var(--color-muted)" }}
            >
              Respect de votre vie privée
            </p>
            <h2
              className="text-lg md:text-xl font-semibold tracking-tight leading-snug mb-4"
              style={{ color: "var(--color-ink)" }}
            >
              Nous utilisons des cookies
            </h2>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--color-body)" }}
            >
              Ice Industry utilise des cookies pour assurer le bon fonctionnement du
              site, mesurer l&apos;audience et vous proposer la meilleure expérience.
              Les cookies essentiels sont toujours actifs.{" "}
              <Link
                href="/legal/cookies"
                className="underline underline-offset-2"
                style={{ color: "var(--color-muted)" }}
              >
                En savoir plus
              </Link>
            </p>
          </div>

          {/* ── Detail panel (categories) ── */}
          <div
            className="overflow-hidden transition-all duration-500 ease-out"
            style={{
              maxHeight: showDetails ? "400px" : "0px",
              opacity: showDetails ? 1 : 0,
            }}
          >
            <div className="px-7 pt-4 pb-2 space-y-4">
              {/* Essential — always on */}
              <div
                className="flex items-start justify-between gap-4 pb-4"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div className="flex-1">
                  <p
                    className="text-xs uppercase tracking-[0.15em] font-medium mb-1"
                    style={{ color: "var(--color-ink)" }}
                  >
                    Essentiels
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    Indispensables au fonctionnement du site : panier, session,
                    sécurité. Toujours actifs.
                  </p>
                </div>
                <div
                  className="w-10 h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "var(--color-ink)", opacity: 0.4 }}
                >
                  <span className="absolute w-4 h-4 rounded-full bg-white" style={{ transform: "translateX(9px)" }} />
                </div>
              </div>

              {/* Toggleable categories */}
              {CATEGORIES.map((cat, i) => (
                <div
                  key={cat.key}
                  className="flex items-start justify-between gap-4 pb-4"
                  style={{
                    borderBottom:
                      i < CATEGORIES.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <label htmlFor={`cookie-${cat.key}`} className="flex-1 cursor-pointer">
                    <p
                      className="text-xs uppercase tracking-[0.15em] font-medium mb-1"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {cat.label}
                    </p>
                    <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
                      {cat.description}
                    </p>
                  </label>
                  <div className="mt-0.5">
                    <Toggle
                      id={`cookie-${cat.key}`}
                      checked={preferences[cat.key]}
                      onChange={() => toggleCategory(cat.key)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="px-7 pt-4 pb-7">
            {!showDetails ? (
              <>
                {/* Primary view: Accept / Refuse / Customize */}
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 h-11 cursor-pointer uppercase tracking-[0.18em] text-[11px] font-medium transition-opacity duration-200 hover:opacity-80"
                    style={{
                      background: "var(--color-ink)",
                      color: "var(--color-surface)",
                    }}
                  >
                    Tout accepter
                  </button>
                  <button
                    onClick={handleRefuseAll}
                    className="flex-1 h-11 cursor-pointer uppercase tracking-[0.18em] text-[11px] font-medium transition-all duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-surface)]"
                    style={{
                      background: "transparent",
                      color: "var(--color-ink)",
                      border: "1px solid var(--color-ink)",
                    }}
                  >
                    Tout refuser
                  </button>
                </div>
                <button
                  onClick={() => setShowDetails(true)}
                  className="w-full text-center py-2 cursor-pointer text-[11px] uppercase tracking-[0.15em] transition-colors duration-200 hover:text-[var(--color-ink)]"
                  style={{ color: "var(--color-muted)" }}
                >
                  Personnaliser mes choix
                </button>
              </>
            ) : (
              <>
                {/* Detail view: Save / back */}
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 h-11 cursor-pointer uppercase tracking-[0.18em] text-[11px] font-medium transition-opacity duration-200 hover:opacity-80"
                    style={{
                      background: "var(--color-ink)",
                      color: "var(--color-surface)",
                    }}
                  >
                    Enregistrer mes choix
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 h-11 cursor-pointer uppercase tracking-[0.18em] text-[11px] font-medium transition-all duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-surface)]"
                    style={{
                      background: "transparent",
                      color: "var(--color-ink)",
                      border: "1px solid var(--color-ink)",
                    }}
                  >
                    Tout accepter
                  </button>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full text-center py-2 cursor-pointer text-[11px] uppercase tracking-[0.15em] transition-colors duration-200 hover:text-[var(--color-ink)]"
                  style={{ color: "var(--color-muted)" }}
                >
                  ← Retour
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Re-open trigger (for footer) ── */

export function CookieSettingsButton() {
  const handleOpen = () => {
    // Clear consent to re-show the banner
    document.cookie = "ice_cookie_consent=;path=/;max-age=0"
    window.location.reload()
  }

  return (
    <button
      onClick={handleOpen}
      className="cursor-pointer text-[10px] text-black/50 hover:text-black transition-colors duration-200 uppercase tracking-wider"
    >
      Cookies
    </button>
  )
}
