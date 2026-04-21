import type { Metadata } from "next"
import { Instrument_Sans } from "next/font/google"
import "./globals.css"
import QueryProvider from "@/providers/QueryProvider"
import { RegionProvider } from "@/providers/RegionProvider"
import { CartProvider } from "@/providers/CartProvider"
import CookieConsent from "@/components/cookie/CookieConsent"
import ConditionalGTM from "@/components/cookie/ConditionalGTM"

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "Ice Industry | Streetwear Marseille",
    template: "%s | Ice Industry",
  },
  description:
    "Marque de streetwear basée à Marseille. Capsules exclusives, accessoires et chaussures multi-marques.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://iceindustry.fr"
  ),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Ice Industry",
  },
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ""

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <RegionProvider>
            <CartProvider>
              {children}
              <CookieConsent />
              {GTM_ID && <ConditionalGTM gtmId={GTM_ID} />}
            </CartProvider>
          </RegionProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
