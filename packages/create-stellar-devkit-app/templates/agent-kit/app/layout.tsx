import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet-provider";
import { AccountProvider } from "@/components/account-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar App — Swap, Send, Prices",
  description: "Swap XLM ↔ USDC, send payments, and view prices. Connect with Freighter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        <WalletProvider>
          <AccountProvider>
            {children}
            <Toaster position="top-center" theme="dark" />
          </AccountProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
