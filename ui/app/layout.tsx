import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LenisProvider } from "@/components/lenis-provider"
import { WalletProvider } from "@/components/wallet-provider"
import { AccountProvider } from "@/components/account-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const metadata: Metadata = {
  title: "Stellar DevKit — Developer suite for Stellar",
  description: "One SDK for payments, DEX swaps, lending, and oracles. Monetize APIs with HTTP 402. Scaffold apps. AI-assisted dev with MCP.",
  generator: "stellar-agent-kit",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <WalletProvider>
          <AccountProvider>
            <LenisProvider>{children}</LenisProvider>
            <Toaster />
          </AccountProvider>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
