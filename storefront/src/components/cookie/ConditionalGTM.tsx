"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { getConsent } from "@/lib/cookies"

/**
 * GTM loader that only fires after marketing consent.
 * Listens for consent changes via cookie polling.
 */
export default function ConditionalGTM({ gtmId }: { gtmId: string }) {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    // Check immediately
    const consent = getConsent()
    if (consent?.marketing) {
      setAllowed(true)
      return
    }

    // Poll for consent changes (cookie_consent_update event)
    const interval = setInterval(() => {
      const c = getConsent()
      if (c?.marketing) {
        setAllowed(true)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!allowed || !gtmId) return null

  return (
    <Script
      id="gtm"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
      }}
    />
  )
}
