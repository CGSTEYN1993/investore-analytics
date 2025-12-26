import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Disclaimer } from '@/components/ui/disclaimer';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'InvestOre Analytics - Mining & Exploration Valuation Platform',
  description: 'Compare mining and exploration companies with peer group analytics, resource normalization, and interactive visualizations. Build custom peer sets, normalize to AuEq/CuEq, and make data-driven decisions.',
  keywords: ['mining', 'exploration', 'valuation', 'analytics', 'peer comparison', 'gold', 'copper', 'lithium', 'AuEq', 'enterprise value', 'mining stocks'],
  authors: [{ name: 'InvestOre Analytics' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'InvestOre Analytics',
    description: 'Mining & Exploration Valuation Platform - Peer analytics, resource normalization, and data visualization',
    url: 'https://www.investoreanalytics.com',
    siteName: 'InvestOre Analytics',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InvestOre Analytics - Mining Valuations Simplified',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestOre Analytics',
    description: 'Mining & Exploration Valuation Platform',
    images: ['/og-image.png'],
  },
  themeColor: '#14b8a6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} bg-metallic-950 text-metallic-100`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Disclaimer />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
