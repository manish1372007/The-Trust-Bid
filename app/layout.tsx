import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { CurrencyProvider } from "@/components/currency-provider";
import { ProviderStatus } from "@/components/provider-status";
import "./globals.css";

const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Trust Bid — never overpay again",
  description: "The Trust Bid compares quotes, negotiates pricing, and surfaces the best option without guesswork.",
};

// Brand mark: three sound bars stepping down (brand-guidelines.pdf §4, SVG source of truth).
function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect width="48" height="48" rx="14" fill="#190A12" />
      <g fill="#E8C5A8">
        <rect x="12" y="14" width="5" height="22" rx="2.5" />
        <rect x="21" y="20" width="5" height="16" rx="2.5" />
        <rect x="30" y="25" width="5" height="11" rx="2.5" />
      </g>
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${space.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="bg-ink text-white">
          <nav className="mx-auto flex max-w-4xl items-center gap-6 px-8 py-3 text-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <Mark />
              <span className="font-display text-base font-bold tracking-[-0.03em]">The Trust Bid</span>
            </Link>
            <Link href="/intake" className="text-white/60 transition hover:text-white">Intake</Link>
            <Link href="/calls" className="text-white/60 transition hover:text-white">Calls</Link>
            <Link href="/report" className="text-white/60 transition hover:text-white">Report</Link>
          </nav>
        </header>
        <CurrencyProvider>{children}</CurrencyProvider>

        <div className="fixed bottom-4 left-4 z-50">
          <ProviderStatus />
        </div>
      </body>
    </html>
  );
}
