import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "x402 Demo - HTTP 402 Payments on Mantle",
  description:
    "Experience HTTP 402 payments in action. A demo app built with x402-mantle-sdk for pay-per-request APIs on Mantle Network.",
  keywords: [
    "x402",
    "HTTP 402",
    "Mantle",
    "Mantle Network",
    "API monetization",
    "blockchain payments",
    "web3 payments",
    "MNT",
  ],
  icons: {
    icon: "/X402.png",
    shortcut: "/X402.png",
    apple: "/X402.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
