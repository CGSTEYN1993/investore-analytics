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
  metadataBase: new URL('https://www.investoreanalytics.com'),
  title: 'InvestOre Analytics - Mining & Exploration Investment Research Platform',
  description: 'Professional investment research platform for mining and exploration stocks. Compare ASX, JSE, TSX mining companies with peer analytics, financial data, and market insights. Trusted by investment professionals.',
  keywords: ['mining stocks', 'exploration companies', 'investment research', 'financial analysis', 'ASX mining', 'JSE mining', 'TSX mining', 'stock market', 'equity research', 'mining valuation', 'gold stocks', 'copper stocks', 'lithium stocks', 'commodity prices', 'market data'],
  authors: [{ name: 'InvestOre Analytics' }],
  category: 'Finance',
  classification: 'Financial Services',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'InvestOre Analytics - Mining Investment Research',
    description: 'Professional investment research platform for mining and exploration stocks. Financial data, peer analytics, and market insights.',
    url: 'https://www.investoreanalytics.com',
    siteName: 'InvestOre Analytics',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InvestOre Analytics - Mining Investment Research Platform',
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
