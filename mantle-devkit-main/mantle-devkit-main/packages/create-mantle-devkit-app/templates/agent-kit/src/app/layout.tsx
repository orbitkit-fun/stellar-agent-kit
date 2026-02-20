import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Mantle DevKit - Agent Kit Demo",
  description:
    "A demo application for swapping tokens on Mantle Network using Agni Finance, Merchant Moe, and OpenOcean.",
  keywords: [
    "Mantle",
    "Agent Kit",
    "DeFi",
    "Swap",
    "Agni Finance",
    "Merchant Moe",
    "OpenOcean",
    "DEX",
    "MNT",
  ],
  icons: {
    icon: "/X402.png",
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
